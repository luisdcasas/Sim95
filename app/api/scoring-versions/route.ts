import { NextRequest, NextResponse } from "next/server";
import { uploadScoringVersionToDB } from "@/lib/scoring/store";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const result = await uploadScoringVersionToDB(body);

  if (!result.ok) {
    return NextResponse.json(result.error, { status: 400 });
  }

  return NextResponse.json(result);
}
