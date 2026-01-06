// lib/upload.ts
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

function safeExt(filename: string) {
  const ext = path.extname(filename || "").toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext)) return ext;
  return ".bin";
}

function publicUploadsDir(subdir: string) {
  return path.join(process.cwd(), "public", "uploads", subdir);
}

export async function savePublicUpload(file: File, subdir: string) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const dir = publicUploadsDir(subdir);
  await fs.mkdir(dir, { recursive: true });

  const ext = safeExt(file.name);
  const name = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const absPath = path.join(dir, name);
  await fs.writeFile(absPath, buffer);

  const urlPath = `/uploads/${subdir}/${name}`;
  return { urlPath, absPath };
}

export async function deletePublicUploadByUrl(urlPath: string | null | undefined) {
  if (!urlPath) return;
  if (!urlPath.startsWith("/uploads/")) return;

  const absPath = path.join(process.cwd(), "public", urlPath);
  try {
    await fs.unlink(absPath);
  } catch {
    // ignore
  }
}
