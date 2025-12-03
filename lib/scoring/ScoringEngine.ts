// lib/scoring/ScoringEngine.ts
import {
    ScoringBundle,
    DependencyGraph,
    ExecutionResult,
    UserAnswersPayload,
  } from "./types";
  import { validateAndPrepareBundle, executeBundle } from "./engine";
  
  export class ScoringEngine {
    bundle: ScoringBundle;
    graph: DependencyGraph;
    versionHash: string;
  
    constructor(rawBundle: unknown) {
      const prep = validateAndPrepareBundle(rawBundle);
      if (prep.error) {
        throw prep.error;
      }
      this.bundle = prep.bundle!;
      this.graph = prep.graph!;
      this.versionHash = prep.versionHash!;
    }
  
    run(input: UserAnswersPayload): ExecutionResult {
      const res = executeBundle(this.bundle, this.graph, this.versionHash, input);
      if ("error" in res) {
        throw res;
      }
      return res;
    }
  }
  