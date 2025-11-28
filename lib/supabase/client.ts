'use client';

import { createBrowserClient } from '@supabase/ssr';

import type { SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient<any, any, any> | null = null;

/**
 * Lazily instantiate a single Supabase browser client.
 * Throws early if required env vars are missing so misconfigurations
 * surface during development instead of at runtime.
 */
export function getSupabaseBrowserClient(): SupabaseClient<any, any, any> {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
}

