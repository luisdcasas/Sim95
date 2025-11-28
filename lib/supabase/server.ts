"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client that can be used inside Route Handlers / Server Actions.
 * Wraps cookie interactions so auth helpers can persist sessions automatically.
 * Note: In Next.js 16, cookies() is async, so this function must be async.
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient<any, any, any>> {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

