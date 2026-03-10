import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const DEFAULT_ROOT = "../uploads";

function getUploadRoot(): string {
  const root = process.env.LOCAL_UPLOAD_ROOT || DEFAULT_ROOT;
  return path.resolve(process.cwd(), root);
}

export async function GET(
  _req: NextRequest,
  context: any,
) {
  const params = context?.params as { path: string[] };
  if (!params?.path || !Array.isArray(params.path)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const relative = params.path.join("/");
  const fullPath = path.join(getUploadRoot(), relative);

  try {
    const data = await fs.readFile(fullPath);
    // Simple generic content type; can be refined later.
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}

