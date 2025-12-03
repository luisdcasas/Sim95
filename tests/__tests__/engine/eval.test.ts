import {
  validateAndPrepareBundle,
  executeBundle
} from "@/lib/scoring/engine";

test("sum + scale works", () => {
  const bundle = {
    version_id: "test",
    variables: {
      v_sum: {
        type: "rule",
        expression: {
          op: "sum",
          inputs: [{ source: "Q1" }, { source: "Q2" }]
        }
      },
      v_scaled: {
        type: "rule",
        expression: {
          op: "scale",
          inputs: [{ source: "v_sum" }],
          min: 0,
          max: 20,
          to: 100
        }
      }
    }
  };

  const prep = validateAndPrepareBundle(bundle);
  expect(prep.error).toBeUndefined();

  const { bundle: prepared, graph, versionHash } = prep;

  const input = {
    user_id: "test-user",
    answers: { Q1: 5, Q2: 5 }
  };

  const result = executeBundle(prepared!, graph!, versionHash!, input);

  if ("error" in result) throw result;

  expect(result.variables.v_sum).toBe(10);
  expect(result.variables.v_scaled).toBe(50);
});
