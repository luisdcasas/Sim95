import crypto from "crypto";

export function computeVersionHash(bundle: unknown): string {
  const json = JSON.stringify(bundle);
  const hash = crypto.createHash("sha256").update(json).digest("base64");
  return `sha256-${hash}`;
}
