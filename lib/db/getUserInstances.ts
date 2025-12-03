// lib/db/getUserInstances.ts
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getUserInstances(userId: string) {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("assessment_instances")
    .select(
      `
      id,
      user_id,
      definition_id,
      status,
      started_at,
      completed_at,
      assessment_results (
        variables,
        version_hash
      )
    `
    )
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (error) {
    console.error("getUserInstances error:", error);
    return [];
  }

  return data ?? [];
}
