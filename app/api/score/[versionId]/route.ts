import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { runScoringAndStoreInstance } from "@/lib/scoring/store";
import type { UserAnswersPayload } from "@/lib/scoring/types";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const { versionId } = await params; // ⬅ FIXES THE TYPE ERROR

  const body = (await req.json()) as UserAnswersPayload;

  const result = await runScoringAndStoreInstance(versionId, body);

  if ("error" in result) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result);
}
