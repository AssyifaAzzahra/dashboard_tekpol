import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { put, del } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_BYTES = 30 * 1024 * 1024; // 30MB (ppt/pdf)
const MAX_IMG_BYTES = 10 * 1024 * 1024; // 10MB (cover)
const OK_FILE = [
  "application/pdf",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
const OK_IMG = ["image/png", "image/jpeg", "image/webp"];

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

function needBlobToken() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("NO_BLOB_TOKEN");
  return token;
}

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function slugFromAny(key: string) {
  const k = clean(key).toLowerCase();
  if (k.startsWith("pks-")) return k.slice(4);
  return k;
}

/**
 * Resolve input pksId dari form menjadi PKS DB record.
 * Input bisa id cuid / slug / pks-slug.
 * Return: { id, slug }
 */
async function resolvePks(input: string) {
  const raw = clean(input);
  if (!raw) return null;

  // 1) kalau raw adalah ID PKS (cuid)
  const byId = await prisma.pks.findUnique({
    where: { id: raw },
    select: { id: true, slug: true, name: true },
  });
  if (byId) return byId;

  // 2) kalau raw adalah slug (tanah-putih)
  const bySlug = await prisma.pks.findFirst({
    where: { slug: raw },
    select: { id: true, slug: true, name: true },
  });
  if (bySlug) return bySlug;

  // 3) kalau raw berupa "pks-xxxx" -> coba slug=xxxx
  const maybeSlug = slugFromAny(raw);
  if (maybeSlug && maybeSlug !== raw) {
    const bySlug2 = await prisma.pks.findFirst({
      where: { slug: maybeSlug },
      select: { id: true, slug: true, name: true },
    });
    if (bySlug2) return bySlug2;
  }

  return null;
}

async function uploadBlob(file: File, pathPrefix: string) {
  const token = needBlobToken();
  const safeName = file.name.replace(/\s+/g, "-");
  const blobPath = `${pathPrefix}/${Date.now()}-${safeName}`;
  const blob = await put(blobPath, file, { access: "public", token });
  return blob.url;
}

/** GET /api/admin/pks-deck -> list semua deck */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const rows = await prisma.pksProfileDeck.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(rows);
}

/**
 * POST /api/admin/pks-deck (FormData):
 * - pksId (boleh: id cuid / slug / pks-slug)
 * - file (ppt/pptx/pdf)
 * - cover (opsional)
 *
 * ✅ Disimpan ke DB dengan pksId = PKS.id (canonical)
 */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  try {
    const form = await req.formData();

    const pksInput = clean(form.get("pksId"));
    if (!pksInput) return bad("pksId is required");

    const pks = await resolvePks(pksInput);
    if (!pks) {
      return bad(
        `PKS tidak ditemukan di database untuk key: "${pksInput}". Pastikan pksId adalah ID PKS atau slug (mis: tanah-putih / pks-tanah-putih).`,
        400
      );
    }

    const canonicalPksId = pks.id; // ✅ ini yang disimpan ke DB

    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return bad("file is required");

    if (file.size > MAX_FILE_BYTES) return bad("Max file 30MB");
    if (!OK_FILE.includes(file.type)) return bad("File harus PPT/PPTX/PDF");

    const cover = form.get("cover");
    if (cover instanceof File) {
      if (cover.size > MAX_IMG_BYTES) return bad("Max cover 10MB");
      if (!OK_IMG.includes(cover.type)) return bad("Cover harus PNG/JPG/WEBP");
    }

    // cari existing (berdasarkan canonical id)
    const existing = await prisma.pksProfileDeck.findUnique({
      where: { pksId: canonicalPksId },
    });

    // upload file & cover baru (path pakai canonical id)
    const fileUrl = await uploadBlob(file, `pks-deck/${canonicalPksId}/file`);
    const coverUrl =
      cover instanceof File && cover.size > 0
        ? await uploadBlob(cover, `pks-deck/${canonicalPksId}/cover`)
        : null;

    const fileName = file.name;
    const fileType = file.type.includes("pdf") ? "pdf" : "ppt";

    // upsert
    const saved = await prisma.pksProfileDeck.upsert({
      where: { pksId: canonicalPksId },
      create: {
        pksId: canonicalPksId,
        fileUrl,
        fileName,
        fileType,
        coverUrl,
      },
      update: {
        fileUrl,
        fileName,
        fileType,
        ...(coverUrl ? { coverUrl } : {}),
      },
    });

    // hapus blob lama (best-effort)
    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (token && existing?.fileUrl && existing.fileUrl !== fileUrl) {
        await del(existing.fileUrl, { token });
      }
      if (token && coverUrl && existing?.coverUrl && existing.coverUrl !== coverUrl) {
        await del(existing.coverUrl, { token });
      }
    } catch {
      // ignore
    }

    // info tambahan biar enak debug
    return NextResponse.json(
      {
        ...saved,
        resolved: { input: pksInput, canonicalPksId, slug: pks.slug, name: pks.name },
      },
      { status: 201 }
    );
  } catch (e: any) {
    if (e?.message === "NO_BLOB_TOKEN") return bad("Env BLOB_READ_WRITE_TOKEN belum ada", 500);
    return bad(e?.message ?? "Upload gagal", 400);
  }
}

/**
 * DELETE /api/admin/pks-deck?pksId=...
 * pksId boleh id/slug/pks-slug -> akan di-resolve ke canonical id
 */
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const { searchParams } = new URL(req.url);
  const input = clean(searchParams.get("pksId"));
  if (!input) return bad("pksId is required");

  const pks = await resolvePks(input);
  if (!pks) return bad(`PKS tidak ditemukan untuk key: "${input}"`, 400);

  const canonicalPksId = pks.id;

  const existing = await prisma.pksProfileDeck.findUnique({
    where: { pksId: canonicalPksId },
  });
  if (!existing) return NextResponse.json({ ok: true });

  await prisma.pksProfileDeck.delete({ where: { pksId: canonicalPksId } });

  // hapus blob (best-effort)
  try {
    const token = needBlobToken();
    if (existing.fileUrl) await del(existing.fileUrl, { token });
    if (existing.coverUrl) await del(existing.coverUrl, { token });
  } catch {
    // ignore
  }

  return NextResponse.json({ ok: true });
}