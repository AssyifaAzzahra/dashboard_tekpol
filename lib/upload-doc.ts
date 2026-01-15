import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "pks-docs");

// max 10 MB
const MAX_BYTES = 10 * 1024 * 1024;

// allow doc types
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
]);

export async function saveUploadedFile(file: File) {
  if (!file) throw new Error("FILE_REQUIRED");

  if (file.size > MAX_BYTES) throw new Error("FILE_TOO_LARGE");

  if (file.type && !ALLOWED_MIME.has(file.type)) {
    throw new Error("FILE_TYPE_NOT_ALLOWED");
  }

  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const safeOriginal = (file.name || "dokumen")
    .replace(/[^\w.\- ]+/g, "_")
    .slice(0, 120);

  const ext = path.extname(safeOriginal) || "";
  const rand = crypto.randomBytes(12).toString("hex");
  const filename = `${Date.now()}-${rand}${ext}`;

  const dest = path.join(UPLOAD_DIR, filename);
  fs.writeFileSync(dest, buffer);

  const fileUrl = `/uploads/pks-docs/${filename}`;

  return {
    fileUrl,
    originalName: safeOriginal,
    mimeType: file.type || null,
    sizeBytes: file.size,
  };
}
