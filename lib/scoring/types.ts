// Expression inputs
export type LiteralInput = { literal: number };
export type SourceInput = { source: string }; // "Q1", "v_archetype_raw", etc.

export type ExpressionInput = LiteralInput | SourceInput;

// Base
type BaseExpression = { inputs?: ExpressionInput[] };

// Numeric ops
export type SumExpression = BaseExpression & { op: "sum" };
export type WeightedSumExpression = BaseExpression & {
  op: "weighted_sum";
  weights: number[];
};
export type MultiplyExpression = BaseExpression & { op: "multiply" };
export type DivideExpression = BaseExpression & { op: "divide" };
export type MinExpression = BaseExpression & { op: "min" };
export type MaxExpression = BaseExpression & { op: "max" };
export type ScaleExpression = BaseExpression & { op: "scale"; factor: number };
export type NormalizeExpression = BaseExpression & { op: "normalize" };

// Comparisons
export type EqualsExpression = {
  op: "equals";
  left: ExpressionInput;
  right: ExpressionInput;
};
export type GtExpression = {
  op: "gt";
  left: ExpressionInput;
  right: ExpressionInput;
};
export type LtExpression = {
  op: "lt";
  left: ExpressionInput;
  right: ExpressionInput;
};

export type ComparisonExpression =
  | EqualsExpression
  | GtExpression
  | LtExpression;

// If
export type IfExpression = {
  op: "if";
  condition: ComparisonExpression;
  then: ExpressionInput;
  else: ExpressionInput;
};

// Map
export type MapExpression = {
  op: "map";
  inputs: ExpressionInput[];
};

// Union of all expression nodes
export type Expression =
  | SumExpression
  | WeightedSumExpression
  | MultiplyExpression
  | DivideExpression
  | MinExpression
  | MaxExpression
  | ScaleExpression
  | NormalizeExpression
  | EqualsExpression
  | GtExpression
  | LtExpression
  | IfExpression
  | MapExpression;

// Variable definition
export type VariableType = "rule";

export interface VariableDefinition {
  type: VariableType;
  expression: Expression;
}

// Scoring bundle (version)
export interface ScoringBundleMetadata {
  created_at: string;
  description: string;
}

export interface ScoringBundle {
  version_id: string;
  metadata: ScoringBundleMetadata;
  variables: Record<string, VariableDefinition>;
}

// User answers
export interface UserAnswersPayload {
  user_id: string;
  answers: Record<string, number>;
}

// Execution result (Phase 1 payload)
export interface ExecutionResult {
  version_id: string;
  version_hash: string;
  variables: Record<string, number>;
  execution_trace: string[];
  dag: {
    nodes: string[];
    edges: Array<{ from: string; to: string }>;
    layers: string[][];
  };
}

// In-memory graph
export interface DependencyGraph {
  nodes: string[];
  edges: Array<{ from: string; to: string }>;
  topoOrder: string[];
  layers: string[][];
}

// Error variants
export type EngineError =
  | { error: "CYCLE_DETECTED"; path: string[] }
  | { error: "MISSING_VARIABLE"; variable: string; referenced_by: string }
  | { error: "INVALID_OPERATOR"; operator: string }
  | { error: "INVALID_REFERENCE"; reference: string; referenced_by: string }
  | { error: "INVALID_SCHEMA"; details: string }
  | { error: "INVALID_QUESTION_ID"; question_id: string }
  | { error: "EXECUTION_ERROR"; details: string; variable?: string }
  | { error: "VERSION_NOT_FOUND"; version_id: string };

export interface StoredVersion {
  bundle: ScoringBundle;
  versionHash: string;
  graph: DependencyGraph;
  locked: boolean;
}
