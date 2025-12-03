// lib/db/getPublishedDefinition.ts
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getPublishedDefinition() {
  const supabase = await getSupabaseServerClient();

  const { data, error } = await supabase
    .from("assessment_definition_versions")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("getPublishedDefinition error:", error);
    return null;
  }

  return data;
}
