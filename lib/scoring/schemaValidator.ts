import { EngineError, ScoringBundle } from "./types";

const VALID_OPERATORS = new Set([
  "sum",
  "weighted_sum",
  "multiply",
  "divide",
  "min",
  "max",
  "scale",
  "normalize",
  "if",
  "equals",
  "gt",
  "lt",
  "map",
]);

export function validateBundleSchema(
  bundle: any
): EngineError | ScoringBundle {
  if (!bundle || typeof bundle !== "object") {
    return { error: "INVALID_SCHEMA", details: "Bundle must be an object" };
  }

  if (typeof bundle.version_id !== "string") {
    return {
      error: "INVALID_SCHEMA",
      details: "version_id must be a string",
    };
  }

  if (!bundle.variables || typeof bundle.variables !== "object") {
    return {
      error: "INVALID_SCHEMA",
      details: "variables must be an object map",
    };
  }

  for (const [varId, def] of Object.entries<any>(bundle.variables)) {
    if (!def || typeof def !== "object") {
      return {
        error: "INVALID_SCHEMA",
        details: `Variable ${varId} must be an object`,
      };
    }

    if (def.type !== "rule") {
      return {
        error: "INVALID_SCHEMA",
        details: `Variable ${varId} has invalid type ${def.type}`,
      };
    }

    if (!def.expression || typeof def.expression !== "object") {
      return {
        error: "INVALID_SCHEMA",
        details: `Variable ${varId} must have an expression`,
      };
    }

    const op = def.expression.op;
    if (!VALID_OPERATORS.has(op)) {
      return { error: "INVALID_OPERATOR", operator: op };
    }
  }

  return bundle as ScoringBundle;
}

// Ensure question ids are Q1..Q95
export function validateQuestionIds(bundle: ScoringBundle): EngineError | null {
  const questionRegex = /^Q(\d+)$/;

  for (const [varId, def] of Object.entries(bundle.variables)) {
    const exprJson = JSON.stringify(def.expression);
    const matches = exprJson.match(/"source":"(Q\d+)"/g) || [];

    for (const match of matches) {
      const [, questionIdRaw] = match.split(":\"") as any;
      const questionId = questionIdRaw.replace(/"$/, "");
      const m = questionRegex.exec(questionId);
      if (!m) {
        return { error: "INVALID_QUESTION_ID", question_id: questionId };
      }
      const idx = parseInt(m[1], 10);
      if (idx < 1 || idx > 95) {
        return { error: "INVALID_QUESTION_ID", question_id: questionId };
      }
    }
  }

  return null;
}
