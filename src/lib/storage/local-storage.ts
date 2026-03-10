import fs from "fs/promises";
import path from "path";

const DEFAULT_ROOT = "../uploads";

function getUploadRoot(): string {
  const root = process.env.LOCAL_UPLOAD_ROOT || DEFAULT_ROOT;
  return path.resolve(process.cwd(), root);
}

export async function saveLocalFile(objectPath: string, file: File): Promise<string> {
  const root = getUploadRoot();
  const fullPath = path.join(root, objectPath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(fullPath, buffer);
  return objectPath;
}

export async function deleteLocalFile(objectPath: string | null | undefined): Promise<void> {
  if (!objectPath) return;
  const root = getUploadRoot();
  const fullPath = path.join(root, objectPath);
  try {
    await fs.unlink(fullPath);
  } catch {
    // ignore if missing
  }
}

export function buildPublicUrlForObject(objectPath: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "http://localhost:3000";
  const encodedPath = objectPath
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return `${base}/api/uploads/${encodedPath}`;
}

