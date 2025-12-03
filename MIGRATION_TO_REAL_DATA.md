# Migration from Mock Data to Real Supabase Data

This document summarizes the migration from using mock assessment definitions to using real data from Supabase.

## Changes Made

### 1. Removed Mock Data Files
- ✅ Deleted `data/mockDefinition.ts` - contained mockAssessmentDefinition
- ✅ Deleted `app/api/seed/sim95/route.ts` - seed endpoint that used mock data
- ✅ Removed empty `data/` directory

### 2. Application Already Uses Real Data

The application was already configured to load assessment definitions from Supabase:

**Location:** `contexts/AssessmentContext.tsx`

```typescript
const loadDefinitions = useCallback(async () => {
  setDefinitionsLoading(true);

  const { data, error } = await supabase
    .from("assessment_definitions")
    .select(
      "id, name, version, description, questions, scoring_rules, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load definitions", error);
    setDefinitions([]);
    setDefinitionsLoading(false);
    return;
  }

  setDefinitions((data ?? []).map(mapDefinitionRow));
  setDefinitionsLoading(false);
}, [mapDefinitionRow, supabase]);
```

## How Data is Loaded

### Assessment Definitions
- **Source:** `assessment_definitions` table in Supabase
- **Loaded by:** `AssessmentContext` component
- **When:** Automatically on app load and when `refreshDefinitions()` is called
- **Access:** Via `useAssessment()` hook

### Assessment Instances
- **Source:** `assessment_instances` table in Supabase
- **Loaded by:** `AssessmentContext` component
- **When:** Automatically on app load and when user is authenticated
- **Access:** Via `useAssessment()` hook

## Managing Assessment Definitions

### Create New Definitions
- Use the Admin UI at `/admin/definitions`
- Click "New Definition" button
- Fill in the form and save

### Edit Existing Definitions
- Navigate to `/admin/definitions`
- Click "Edit" on any definition
- Make changes and save

### View Definitions
- All users can view definitions (read-only)
- Definitions are loaded automatically from Supabase

## Database Schema

The application uses the following Supabase table:

```sql
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
```

## Verification

To verify the app is using real Supabase data:

1. **Check the database:**
   - Go to your Supabase dashboard
   - Check the `assessment_definitions` table
   - Confirm your definitions are stored there

2. **Check the application:**
   - The dashboard shows definitions from Supabase
   - Admin panel allows CRUD operations on definitions
   - All data persists to the database

3. **No mock data remains:**
   - ✅ No imports of `mockAssessmentDefinition`
   - ✅ No seed endpoints using mock data
   - ✅ All data comes from Supabase queries

## Benefits

- ✅ **Real data persistence** - All definitions stored in database
- ✅ **No code duplication** - Single source of truth
- ✅ **Production ready** - No mock data dependencies
- ✅ **Admin management** - Full CRUD operations via UI
- ✅ **Scalable** - Database-backed solution

