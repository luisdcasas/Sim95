import { validateAndPrepareBundle } from "@/lib/scoring/engine";

test("detects cycles", () => {
  const bundle = {
    version_id: "bad",
    variables: {
      A: {
        type: "rule",
        expression: { op: "sum", inputs: [{ source: "B" }] }
      },
      B: {
        type: "rule",
        expression: { op: "sum", inputs: [{ source: "A" }] }
      }
    }
  };

  const prep = validateAndPrepareBundle(bundle);

  expect(prep.error).toBeDefined();
  expect(prep.error!.error).toBe("CYCLE_DETECTED");
});
