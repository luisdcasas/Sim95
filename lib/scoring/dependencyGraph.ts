import { DependencyGraph, EngineError, ScoringBundle } from "./types";

export function buildDependencyGraph(
  bundle: ScoringBundle
): DependencyGraph | EngineError {
  const variables = bundle.variables;
  const nodes = Object.keys(variables).sort();

  const edges: Array<{ from: string; to: string }> = [];
  const adjacency: Record<string, Set<string>> = {};
  const indegree: Record<string, number> = {};

  for (const v of nodes) {
    adjacency[v] = new Set();
    indegree[v] = 0;
  }

  const sourceRegex = /"source":"([^"]+)"/g;

  for (const [varId, def] of Object.entries(variables)) {
    const exprJson = JSON.stringify(def.expression);
    let match: RegExpExecArray | null;

    while ((match = sourceRegex.exec(exprJson))) {
      const ref = match[1];
      if (ref.startsWith("v_")) {
        if (!variables[ref]) {
          return {
            error: "MISSING_VARIABLE",
            variable: ref,
            referenced_by: varId,
          };
        }
        if (!adjacency[ref].has(varId)) {
          adjacency[ref].add(varId);
          edges.push({ from: ref, to: varId });
          indegree[varId] += 1;
        }
      }
    }
  }

  // Kahn's algorithm
  const queue: string[] = [];
  for (const node of nodes) {
    if (indegree[node] === 0) queue.push(node);
  }
  queue.sort(); // deterministic alphabetical

  const topoOrder: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    topoOrder.push(current);

    const neighbors = Array.from(adjacency[current]).sort();
    for (const n of neighbors) {
      indegree[n] -= 1;
      if (indegree[n] === 0) {
        queue.push(n);
        queue.sort();
      }
    }
  }

  if (topoOrder.length !== nodes.length) {
    const remaining = nodes.filter((n) => !topoOrder.includes(n));
    return { error: "CYCLE_DETECTED", path: remaining };
  }

  // Layers (depth)
  const layers: string[][] = [];
  const depth: Record<string, number> = {};

  for (const node of topoOrder) {
    let d = 0;
    for (const edge of edges.filter((e) => e.to === node)) {
      d = Math.max(d, (depth[edge.from] ?? 0) + 1);
    }
    depth[node] = d;
    if (!layers[d]) layers[d] = [];
    layers[d].push(node);
  }

  return { nodes, edges, topoOrder, layers };
}
