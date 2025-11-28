import { NextResponse } from "next/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const user_id = url.searchParams.get("user_id");

  if (!user_id)
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("assessment_instances")
    .select("id, version_id, computed_results, created_at")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ instances: data });
}
