// app/api/admin/pks-deck/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { put, del } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SIZE_BYTES = 30 * 1024 * 1024;

function extType(name: string, mime: string) {
  const lower = name.toLowerCase();
  if (lower.endsWith(".pdf") || mime === "application/pdf") return "pdf";
  if (lower.endsWith(".pptx")) return "pptx";
  if (lower.endsWith(".ppt")) return "ppt";
  return "unknown";
}

export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const rows = await prisma.pksProfileDeck.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const form = await req.formData();
  const pksId = String(form.get("pksId") || "");
  const file = form.get("file");
  const cover = form.get("cover"); // ✅ optional cover image

  if (!pksId) return NextResponse.json({ error: "pksId is required" }, { status: 400 });
  if (!file || !(file instanceof File))
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  if (file.size > MAX_SIZE_BYTES)
    return NextResponse.json({ error: "Max 30MB" }, { status: 400 });

  const okTypes = [
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];
  if (!okTypes.includes(file.type)) {
    return NextResponse.json({ error: "File harus PDF / PPT / PPTX" }, { status: 400 });
  }

  if (cover && cover instanceof File) {
    const okCover = ["image/png", "image/jpeg", "image/webp"];
    if (!okCover.includes(cover.type)) {
      return NextResponse.json({ error: "Cover harus PNG/JPG/WEBP" }, { status: 400 });
    }
  }

  const fileType = extType(file.name, file.type);

  // upload file utama
  const safeName = file.name.replace(/\s+/g, "-");
  const blobPath = `pks-decks/${pksId}/${Date.now()}-${safeName}`;
  const blob = await put(blobPath, file, { access: "public" });

  const old = await prisma.pksProfileDeck.findUnique({ where: { pksId } });

  // default: pakai cover lama kalau tidak upload cover baru
  let coverUrl: string | null = old?.coverUrl ?? null;
  let newCoverBlobUrl: string | null = null;

  // ✅ jika admin upload cover image
  if (cover && cover instanceof File) {
    const coverName = cover.name.replace(/\s+/g, "-");
    const coverPath = `pks-decks/${pksId}/${Date.now()}-cover-${coverName}`;
    const coverBlob = await put(coverPath, cover, { access: "public" });
    newCoverBlobUrl = coverBlob.url;
    coverUrl = newCoverBlobUrl;
  }

  const upserted = await prisma.pksProfileDeck.upsert({
    where: { pksId },
    create: { pksId, fileUrl: blob.url, fileName: file.name, fileType, coverUrl },
    update: { fileUrl: blob.url, fileName: file.name, fileType, coverUrl },
  });

  // cleanup file lama (best-effort)
  if (old?.fileUrl) {
    try {
      await del(old.fileUrl);
    } catch {}
  }

  // cleanup cover lama jika diganti
  if (old?.coverUrl && newCoverBlobUrl && old.coverUrl !== newCoverBlobUrl) {
    try {
      await del(old.coverUrl);
    } catch {}
  }

  return NextResponse.json(upserted);
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const { searchParams } = new URL(req.url);
  const pksId = searchParams.get("pksId");

  if (!pksId) return NextResponse.json({ error: "pksId is required" }, { status: 400 });

  const existing = await prisma.pksProfileDeck.findUnique({ where: { pksId } });
  if (!existing) return NextResponse.json({ ok: true });

  await prisma.pksProfileDeck.delete({ where: { pksId } });

  try {
    await del(existing.fileUrl);
  } catch {}
  if (existing.coverUrl) {
    try {
      await del(existing.coverUrl);
    } catch {}
  }

  return NextResponse.json({ ok: true });
}
