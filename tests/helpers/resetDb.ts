import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function resetDb() {
  const tables = [
    "assessment_reports",
    "assessment_results",
    "assessment_instances",
    "assessment_definition_versions",
    "assessment_definitions"
  ];

  for (const t of tables)
    await supabase.from(t).delete().neq("id", "___keep");
}
