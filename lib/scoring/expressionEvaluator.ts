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
  
  function resolveInput(ctx: EvaluationContext, input: ExpressionInput): number {
    if ("literal" in input) return input.literal;
  
    const ref = input.source;
  
    if (ref.startsWith("Q")) {
      const value = ctx.answers[ref];
      if (value === undefined) {
        throw new Error(`Missing answer for ${ref}`);
      }
      return value;
    }
  
    const value = ctx.variables[ref];
    if (value === undefined) {
      throw new Error(`Missing variable value for ${ref}`);
    }
    return value;
  }
  
  export function evaluateExpression(
    ctx: EvaluationContext,
    expr: Expression
  ): number {
    switch (expr.op) {
      case "sum": {
        const inputs = expr.inputs ?? [];
        return inputs.reduce((acc, cur) => acc + resolveInput(ctx, cur), 0);
      }
  
      case "weighted_sum": {
        const inputs = expr.inputs ?? [];
        const weights = expr.weights ?? [];
        if (inputs.length !== weights.length) {
          throw new Error("weights length must match inputs length");
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
  
      case "scale": {
        const inputs = expr.inputs ?? [];
        if (inputs.length !== 1) throw new Error("scale requires 1 input");
        return resolveInput(ctx, inputs[0]) * expr.factor;
      }
  
      case "normalize": {
        const inputs = expr.inputs ?? [];
        if (inputs.length !== 1) throw new Error("normalize requires 1 input");
        const v = resolveInput(ctx, inputs[0]);
        // For now: normalize 0..10 to 0..1
        return v / 10;
      }
  
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
  
      case "if": {
        const condValue = evaluateExpression(ctx, expr.condition as any);
        const chosen = condValue !== 0 ? expr.then : expr.else;
        return resolveInput(ctx, chosen);
      }
  
      case "map": {
        // Simplified: sum mapped values
        const inputs = expr.inputs ?? [];
        return inputs.reduce((acc, cur) => acc + resolveInput(ctx, cur), 0);
      }
  
      default: {
        const _never: never = expr;
        throw new Error(`Unsupported expression op: ${(expr as any).op}`);
      }
    }
  }
  