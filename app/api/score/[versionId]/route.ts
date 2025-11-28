import { NextResponse } from "next/server";
import { runScoringAndStoreInstance } from "@/lib/scoring/store";
import type { UserAnswersPayload } from "@/lib/scoring/types";

interface Params {
  params: { versionId: string };
}

export async function POST(req: Request, { params }: Params) {
  const { versionId } = params;
  const body = (await req.json()) as UserAnswersPayload;

  const result = await runScoringAndStoreInstance(versionId, body);
  if ("error" in result) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
