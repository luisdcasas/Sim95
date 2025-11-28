import { getSupabaseServiceClient } from "@/lib/supabase/service";
import {
  ScoringBundle,
  EngineError,
  StoredVersion
} from "./types";

export async function saveVersionToDB(stored: StoredVersion) {
  const { bundle, versionHash, graph } = stored;
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("scoring_versions")
    .insert({
      version_id: bundle.version_id,
      version_hash: versionHash,
      bundle,
      dag: graph,
      locked: false
    });

  if (error) throw new Error(error.message);
}

export async function lockVersionInDB(versionId: string) {
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("scoring_versions")
    .update({ locked: true })
    .eq("version_id", versionId);

  if (error) throw new Error(error.message);
}

export async function fetchVersionFromDB(versionId: string): Promise<StoredVersion | null> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("scoring_versions")
    .select("*")
    .eq("version_id", versionId)
    .single();

  if (error || !data) return null;

  return {
    bundle: data.bundle,
    versionHash: data.version_hash,
    graph: data.dag,
    locked: data.locked
  };
}
