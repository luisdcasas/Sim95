import { validateAndPrepareBundle } from "@/lib/scoring/engine";

test("missing variable throws", () => {
  const bundle = {
    version_id: "bad",
    variables: {
      A: {
        type: "rule",
        expression: {
          op: "sum",
          inputs: [
            { source: "Q1" },
            { source: "v_not_exist" }
          ]
        }
      }
    }
  };

  const prep = validateAndPrepareBundle(bundle);

  expect(prep.error).toBeDefined();
  expect(prep.error!.error).toBe("MISSING_VARIABLE");
});
