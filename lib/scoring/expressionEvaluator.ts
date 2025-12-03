import {
  Expression,
  ExpressionInput,
  UserAnswersPayload,
} from "./types";

export type VariableValues = Record<string, number>;

export interface EvaluationContext {
  answers: UserAnswersPayload["answers"];
  variables: VariableValues;
}

/**
 * Resolve a primitive input:
 * - literal number
 * - question reference ("Q1", "Q2", ...)
 * - variable reference ("v_sum", etc.)
 */
function resolveInput(ctx: EvaluationContext, input: ExpressionInput): number {
  if ("literal" in input) return input.literal;

  const ref = input.source;

  // Question answer
  if (ref.startsWith("Q")) {
    const value = ctx.answers[ref];
    if (value === undefined) {
      throw new Error(`Missing answer for ${ref}`);
    }
    return value;
  }

  // Derived variable
  const value = ctx.variables[ref];
  if (value === undefined) {
    throw new Error(`Missing variable value for ${ref}`);
  }
  return value;
}

/**
 * Small helper: sometimes we want to accept either an Expression
 * or a simple ExpressionInput (e.g. in IF then/else).
 */
function evalOrResolve(
  ctx: EvaluationContext,
  node: Expression | ExpressionInput
): number {
  // Discriminator: Expression always has an "op" field
  return "op" in node
    ? evaluateExpression(ctx, node as Expression)
    : resolveInput(ctx, node as ExpressionInput);
}

export function evaluateExpression(
  ctx: EvaluationContext,
  expr: Expression
): number {
  switch (expr.op) {
    // -----------------------------------------------------------------------
    // Aggregation
    // -----------------------------------------------------------------------
    case "sum": {
      const inputs = expr.inputs ?? [];
      return inputs.reduce((acc, cur) => acc + resolveInput(ctx, cur), 0);
    }

    case "weighted_sum": {
      const inputs = expr.inputs ?? [];
      const weights = expr.weights ?? [];
      if (inputs.length !== weights.length) {
        throw new Error("weighted_sum: weights length must match inputs length");
      }
      let sum = 0;
      for (let i = 0; i < inputs.length; i++) {
        sum += resolveInput(ctx, inputs[i]) * weights[i];
      }
      return sum;
    }

    case "multiply": {
      const inputs = expr.inputs ?? [];
      if (inputs.length < 2) throw new Error("multiply requires 2+ inputs");
      return inputs.reduce(
        (acc, cur) => acc * resolveInput(ctx, cur),
        1
      );
    }

    case "divide": {
      const inputs = expr.inputs ?? [];
      if (inputs.length !== 2) throw new Error("divide requires 2 inputs");
      const a = resolveInput(ctx, inputs[0]);
      const b = resolveInput(ctx, inputs[1]);
      if (b === 0) throw new Error("division by zero");
      return a / b;
    }

    case "min": {
      const inputs = expr.inputs ?? [];
      if (inputs.length === 0) throw new Error("min requires inputs");
      return Math.min(...inputs.map((i) => resolveInput(ctx, i)));
    }

    case "max": {
      const inputs = expr.inputs ?? [];
      if (inputs.length === 0) throw new Error("max requires inputs");
      return Math.max(...inputs.map((i) => resolveInput(ctx, i)));
    }

    // -----------------------------------------------------------------------
    // Scaling / normalization
    // -----------------------------------------------------------------------
    case "scale": {
      const inputs = expr.inputs ?? [];
      if (inputs.length !== 1) throw new Error("scale requires 1 input");

      const v = resolveInput(ctx, inputs[0]);

      // More flexible than fixed "factor" only:
      // - if min/max/to provided → map [min,max] → [0,to]
      // - else fallback to simple factor multiply
      if (typeof expr.min === "number" && typeof expr.max === "number") {
        const fromMin = expr.min;
        const fromMax = expr.max;
        if (fromMax === fromMin) {
          throw new Error("scale: max and min cannot be equal");
        }
        const toMax = typeof expr.to === "number" ? expr.to : 1;
        const norm = (v - fromMin) / (fromMax - fromMin); // 0..1
        return norm * toMax;
      }

      if (typeof expr.factor !== "number") {
        throw new Error("scale: either factor or (min,max[,to]) must be provided");
      }
      return v * expr.factor;
    }

    case "normalize": {
      const inputs = expr.inputs ?? [];
      if (inputs.length !== 1) throw new Error("normalize requires 1 input");
      const v = resolveInput(ctx, inputs[0]);

      // Configurable normalize:
      //  - if expr.min/expr.max provided, use that
      //  - else default 0..10 → 0..1 (your previous behavior)
      const min = typeof expr.min === "number" ? expr.min : 0;
      const max = typeof expr.max === "number" ? expr.max : 10;
      if (max === min) {
        throw new Error("normalize: max and min cannot be equal");
      }
      return (v - min) / (max - min);
    }

    // -----------------------------------------------------------------------
    // Comparisons (return 1/0 so they can be used inside other ops)
    // -----------------------------------------------------------------------
    case "equals":
    case "gt":
    case "lt": {
      const left = resolveInput(ctx, expr.left);
      const right = resolveInput(ctx, expr.right);
      if (expr.op === "equals") return left === right ? 1 : 0;
      if (expr.op === "gt") return left > right ? 1 : 0;
      if (expr.op === "lt") return left < right ? 1 : 0;
      throw new Error("Unknown comparison op");
    }

    // -----------------------------------------------------------------------
    // Conditionals
    // -----------------------------------------------------------------------
    case "if": {
      // condition is itself an Expression
      const condValue = evaluateExpression(ctx, expr.condition as Expression);

      // then/else can be either Expression *or* ExpressionInput
      const chosen = condValue !== 0 ? expr.then : expr.else;
      if (!chosen) {
        throw new Error("if: missing then/else branch");
      }
      return evalOrResolve(ctx, chosen as any);
    }

    // -----------------------------------------------------------------------
    // Mapping (categorical → numeric)
    // -----------------------------------------------------------------------
    case "map": {
      // We’ll assume your Expression type for "map" looks roughly like:
      // { op: "map"; input: ExpressionInput; table: Record<string, number>; default?: number }
      // If your actual field names differ you can adjust them here.

      const input = (expr as any).input as ExpressionInput | undefined;
      const table = (expr as any).table as Record<string, number> | undefined;
      const defaultValue = (expr as any).defaultValue as number | undefined;

      if (!input) {
        throw new Error("map: 'input' is required");
      }
      if (!table) {
        throw new Error("map: 'table' is required");
      }

      const raw = resolveInput(ctx, input);
      const key = String(raw);

      if (Object.prototype.hasOwnProperty.call(table, key)) {
        return table[key];
      }

      if (defaultValue !== undefined) {
        return defaultValue;
      }

      throw new Error(`map: no mapping found for value ${raw}`);
    }

    // -----------------------------------------------------------------------
    // Fallback
    // -----------------------------------------------------------------------
    default: {
      // This makes TS complain if we forget to handle a new op
      const _never: never = expr;
      throw new Error(`Unsupported expression op: ${(expr as any).op}`);
    }
  }
}
