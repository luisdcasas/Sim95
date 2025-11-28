import { NextRequest, NextResponse } from "next/server";
import { lockScoringVersionInDB } from "@/lib/scoring/store";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const { versionId } = await params;

  const result = await lockScoringVersionInDB(versionId);

  if (!result.ok) {
    return NextResponse.json(result.error, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
