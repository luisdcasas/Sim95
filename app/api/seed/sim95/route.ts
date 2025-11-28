import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mockAssessmentDefinition } from "@/data/mockDefinition";

// Use service role key to bypass RLS for seeding
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // MUST exist in .env.local
);

export async function GET() {
  try {
    const {
      id,
      name,
      version,
      description,
      questions,
      scoringRules,
      createdAt,
      updatedAt,
    } = mockAssessmentDefinition;

    const { data, error } = await supabase
      .from("assessment_definitions")
      .upsert(
        {
          id: id, 
          name: name,
          version: version,
          description: description,
          questions: questions,
          scoring_rules: scoringRules,
          created_at: createdAt ?? new Date().toISOString(),
          updated_at: updatedAt ?? new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({
      inserted: true,
      definition: data,
    });
  } catch (err: any) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
