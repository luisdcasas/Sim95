import { getSupabaseServiceClient } from "@/lib/supabase/service";
import {
  EngineError,
  ExecutionResult,
  StoredVersion,
  UserAnswersPayload,
} from "./types";
import { validateAndPrepareBundle, executeBundle } from "./engine";

export async function uploadScoringVersionToDB(
  rawBundle: unknown
):
  Promise<
    | { ok: true; versionId: string; versionHash: string; dag: StoredVersion["graph"] }
    | { ok: false; error: EngineError }
  > {
  const result = validateAndPrepareBundle(rawBundle);
  if (result.error || !result.bundle || !result.graph || !result.versionHash) {
    return { ok: false, error: result.error! };
  }

  const supabase = getSupabaseServiceClient();

  const { error } = await supabase.from("scoring_versions").insert({
    version_id: result.bundle.version_id,
    version_hash: result.versionHash,
    bundle: result.bundle,
    dag: result.graph,
    locked: false,
  });

  if (error) {
    return {
      ok: false,
      error: { error: "INVALID_SCHEMA", details: error.message },
    };
  }

  return {
    ok: true,
    versionId: result.bundle.version_id,
    versionHash: result.versionHash,
    dag: result.graph,
  };
}

export async function lockScoringVersionInDB(
  versionId: string
): Promise<{ ok: true } | { ok: false; error: EngineError }> {
  const supabase = getSupabaseServiceClient();

  const { error } = await supabase
    .from("scoring_versions")
    .update({ locked: true })
    .eq("version_id", versionId);

  if (error) {
    return {
      ok: false,
      error: { error: "INVALID_SCHEMA", details: error.message },
    };
  }

  return { ok: true };
}

export async function getStoredVersion(
  versionId: string
): Promise<StoredVersion | EngineError> {
  const supabase = getSupabaseServiceClient();

  const { data, error } = await supabase
    .from("scoring_versions")
    .select("*")
    .eq("version_id", versionId)
    .single();

  if (error || !data) {
    return { error: "VERSION_NOT_FOUND", version_id: versionId };
  }

  return {
    bundle: data.bundle,
    versionHash: data.version_hash,
    graph: data.dag,
    locked: data.locked,
  };
}

export async function runScoringAndStoreInstance(
  versionId: string,
  input: UserAnswersPayload
): Promise<ExecutionResult | EngineError> {
  const version = await getStoredVersion(versionId);
  if ("error" in version) return version;

  const result = executeBundle(
    version.bundle,
    version.graph,
    version.versionHash,
    input
  );

  if ("error" in result) return result;

  // Persist assessment instance
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("assessment_instances").insert({
    user_id: input.user_id,
    version_id: versionId,
    raw_answers: input.answers,
    computed_results: result,
  });

  if (error) {
    return {
      error: "INVALID_SCHEMA",
      details: `Failed to store assessment instance: ${error.message}`,
    };
  }

  return result;
}
