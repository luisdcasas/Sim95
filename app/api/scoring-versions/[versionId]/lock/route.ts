import { NextResponse } from "next/server";
import { lockScoringVersionInDB } from "@/lib/scoring/store";

interface Params {
  params: { versionId: string };
}

export async function POST(_req: Request, { params }: Params) {
  const { versionId } = params;

  const result = await lockScoringVersionInDB(versionId);
  if (!result.ok) {
    return NextResponse.json(result.error, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
