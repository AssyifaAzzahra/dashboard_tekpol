// lib/upload.ts
import crypto from "crypto";
import { put, del } from "@vercel/blob";

function safeExt(filename: string) {
  const ext = (filename?.split(".").pop() || "").toLowerCase();
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return `.${ext}`;
  return ".bin";
}

export async function savePublicUpload(file: File, subdir: string) {
  const ext = safeExt(file.name);
  const name = `${Date.now()}-${crypto.randomUUID()}${ext}`;

  const blob = await put(`uploads/${subdir}/${name}`, file, {
    access: "public",
    contentType: file.type || "application/octet-stream",
  });

  return { urlPath: blob.url }; // simpan FULL URL
}

export async function deletePublicUploadByUrl(urlPath: string | null | undefined) {
  if (!urlPath) return;
  try {
    await del(urlPath);
  } catch {
    // ignore
  }
}
