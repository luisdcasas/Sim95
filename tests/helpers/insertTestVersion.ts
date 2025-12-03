import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function insertTestVersion() {
  const scoring_bundle = {
    version_id: "test-v1",
    variables: {
      v_sum: {
        type: "rule",
        expression: {
          op: "sum",
          inputs: [{ source: "Q1" }, { source: "Q2" }]
        }
      }
    }
  };

  const questions = [
    {
      id: "Q1",
      prompt: "How are you?",
      type: "likert",
      options: [
        { label: "1", value: 1 },
        { label: "5", value: 5 }
      ]
    },
    {
      id: "Q2",
      prompt: "How do you feel?",
      type: "likert",
      options: [
        { label: "1", value: 1 },
        { label: "5", value: 5 }
      ]
    }
  ];

  const templates = {
    archetypes: {
      primary: {
        source: "v_sum",
        blocks: {
          "10": { title: "Builder", description: "..." }
        }
      }
    }
  };

  const { data: def } = await supabase
    .from("assessment_definitions")
    .insert({ slug: "sim95", display_name: "SIM95" })
    .select()
    .single();

  const { data: ver } = await supabase
    .from("assessment_definition_versions")
    .insert({
      definition_id: def.id,
      version_id: "test-v1",
      status: "published",
      questions_json: questions,
      scoring_bundle_json: scoring_bundle,
      report_templates_json: templates,
      version_hash: "hash"
    })
    .select()
    .single();

  await supabase
    .from("assessment_definitions")
    .update({ current_version_id: ver.id })
    .eq("id", def.id);
}
