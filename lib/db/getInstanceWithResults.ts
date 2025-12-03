// lib/db/getInstanceWithResults.ts
import { getSupabaseServerClient  } from "@/lib/supabase/server";

export async function getInstanceWithResults(instanceId: string) {
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
      ),
      assessment_reports (
        report_json
      )
    `
    )
    .eq("id", instanceId)
    .single();

  if (error) {
    console.error("getInstanceWithResults error:", error);
    return null;
  }

  return data;
}
