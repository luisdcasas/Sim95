import { NextResponse } from "next/server";
import { getStoredVersion } from "@/lib/scoring/store";

interface Params {
  params: { versionId: string };
}

export async function GET(_req: Request, { params }: Params) {
  const { versionId } = params;

  const version = await getStoredVersion(versionId);
  if ("error" in version) {
    return NextResponse.json(version, { status: 404 });
  }

  return NextResponse.json(version.graph);
}
