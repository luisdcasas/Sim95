// lib/db/getUserProfile.ts
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getUserProfile() {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Profile load error:", error);
  }

  return { user, profile };
}
