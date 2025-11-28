import { NextResponse } from "next/server";
import { getStoredVersion } from "@/lib/scoring/store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const { versionId } = await params; // ⬅ FIXED

  const version = await getStoredVersion(versionId);

  if ("error" in version) {
    return NextResponse.json(version, { status: 404 });
  }

  return NextResponse.json(version.graph);
}
