import {
    DependencyGraph,
    EngineError,
    ExecutionResult,
    ScoringBundle,
    UserAnswersPayload,
  } from "./types";
  import { validateBundleSchema, validateQuestionIds } from "./schemaValidator";
  import { buildDependencyGraph } from "./dependencyGraph";
  import { evaluateExpression } from "./expressionEvaluator";
  import { computeVersionHash } from "./hash";
  
  export function validateAndPrepareBundle(
    rawBundle: unknown
  ): {
    bundle?: ScoringBundle;
    graph?: DependencyGraph;
    versionHash?: string;
    error?: EngineError;
  } {
    const schemaResult = validateBundleSchema(rawBundle);
    if ("error" in schemaResult) {
      return { error: schemaResult };
    }
  
    const bundle = schemaResult;
    const questionError = validateQuestionIds(bundle);
    if (questionError) return { error: questionError };
  
    const graph = buildDependencyGraph(bundle);
    if ("error" in graph) {
      return { error: graph };
    }
  
    const versionHash = computeVersionHash(bundle);
  
    return { bundle, graph, versionHash };
  }
  
  export function executeBundle(
    bundle: ScoringBundle,
    graph: DependencyGraph,
    versionHash: string,
    input: UserAnswersPayload
  ): ExecutionResult | EngineError {
    const variables: Record<string, number> = {};
    const trace: string[] = [];
  
    try {
      for (const varId of graph.topoOrder) {
        const def = bundle.variables[varId];
        const value = evaluateExpression(
          { answers: input.answers, variables },
          def.expression
        );
        variables[varId] = value;
        trace.push(varId);
      }
    } catch (err: any) {
      return {
        error: "EXECUTION_ERROR",
        details: err?.message ?? "Unknown error",
        variable: trace[trace.length - 1],
      };
    }
  
    return {
      version_id: bundle.version_id,
      version_hash: versionHash,
      variables,
      execution_trace: trace,
      dag: {
        nodes: graph.nodes,
        edges: graph.edges,
        layers: graph.layers,
      },
    };
  }
  