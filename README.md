This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Supabase Setup

1. Create a Supabase project and copy the anon + service role keys.
2. Duplicate `.env.example` → `.env.local` and fill:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```
3. Run the SQL below inside the Supabase SQL editor to provision the required tables/policies.

```sql
create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text check (role in ('user','admin')) default 'user',
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.assessment_definitions (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  version text not null,
  description text,
  questions jsonb not null default '[]'::jsonb,
  scoring_rules jsonb not null default '{}'::jsonb,
  created_at timestamptz default timezone('utc', now()),
  updated_at timestamptz default timezone('utc', now())
);

create table if not exists public.assessment_instances (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  definition_id uuid not null references public.assessment_definitions (id) on delete cascade,
  version text not null,
  status text not null check (status in ('in_progress','completed','archived')),
  raw_answers jsonb not null default '{}'::jsonb,
  computed_results jsonb,
  started_at timestamptz default timezone('utc', now()),
  completed_at timestamptz,
  created_at timestamptz default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.assessment_definitions enable row level security;
alter table public.assessment_instances enable row level security;

-- helper function to detect admins based on the profiles table
create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create policy "profiles are readable/writable by owner" on public.profiles
  for all using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "any authenticated user can read definitions" on public.assessment_definitions
  for select using (auth.role() = 'authenticated');

create policy "only admins manage definitions" on public.assessment_definitions
  for all using (public.is_admin())
  with check (public.is_admin());

create policy "users manage their own instances" on public.assessment_instances
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "admins see all instances" on public.assessment_instances
  for select using (public.is_admin());
```

4. (Optional) add triggers to keep `updated_at` current or seed an initial SIM95 definition row.

With the tables + policies in place, the app will authenticate via Supabase, load assessment definitions from the database, store user answers per instance, and persist computed JSON reports for future analytics.
