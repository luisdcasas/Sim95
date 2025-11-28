import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function GET() {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("scoring_versions")
    .select("version_id, version_hash, created_at, locked");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ definitions: data });
}
