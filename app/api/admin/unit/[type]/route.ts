import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UnitType = "pks" | "ppis" | "ppkr";

const MAX_IMG_BYTES = 10 * 1024 * 1024;
const OK_IMG = ["image/png", "image/jpeg", "image/webp"];

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * Ambil type dari:
 * 1) params.type / params.kind (kalau Next kirim)
 * 2) fallback dari URL: /api/admin/unit/<type>
 *
 * FIX: tidak salah ambil "unit"
 */
function resolveType(req: NextRequest, params: Record<string, any>): UnitType | null {
  const fromParams =
    (typeof params?.type === "string" ? params.type : undefined) ??
    (typeof params?.kind === "string" ? params.kind : undefined);

  let fromUrl: string | undefined;
  try {
    const pathname = new URL(req.url).pathname; // /api/admin/unit/pks
    const parts = pathname.split("/").filter(Boolean); // ["api","admin","unit","pks"]
    const idx = parts.lastIndexOf("unit");
    if (idx >= 0 && parts[idx + 1]) fromUrl = parts[idx + 1];
    else fromUrl = parts[parts.length - 1];
  } catch {
    fromUrl = undefined;
  }

  const raw = String(fromParams ?? fromUrl ?? "").toLowerCase().trim();
  if (raw === "pks" || raw === "ppis" || raw === "ppkr") return raw;
  return null;
}

async function uploadImage(file: File, pathPrefix: string) {
  if (!OK_IMG.includes(file.type)) throw new Error("IMAGE_ONLY");
  if (file.size > MAX_IMG_BYTES) throw new Error("IMAGE_TOO_BIG");

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error("NO_BLOB_TOKEN");

  const safeName = file.name.replace(/\s+/g, "-");
  const blobPath = `${pathPrefix}/${Date.now()}-${safeName}`;

  const blob = await put(blobPath, file, {
    access: "public",
    token,
  });

  return blob.url;
}

function parseOptionalNumber(v: string): number | null {
  const t = String(v ?? "").trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

/* ======================================================
   GET
====================================================== */
export async function GET(req: NextRequest, { params }: { params: Record<string, any> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const type = resolveType(req, params);
  if (!type) return bad("Invalid type");

  const rows =
    type === "pks"
      ? await prisma.pks.findMany({ orderBy: { updatedAt: "desc" } })
      : type === "ppis"
      ? await prisma.ppis.findMany({ orderBy: { updatedAt: "desc" } })
      : await prisma.ppkr.findMany({ orderBy: { updatedAt: "desc" } });

  return NextResponse.json(rows);
}

/* ======================================================
   POST
====================================================== */
export async function POST(req: NextRequest, { params }: { params: Record<string, any> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const type = resolveType(req, params);
  if (!type) return bad("Invalid type");

  const form = await req.formData();

  const name = String(form.get("name") || "").trim();
  const slug = slugify(String(form.get("slug") || "").trim());

  if (!name) return bad("name is required");
  if (!slug) return bad("slug is required");

  const shortProfile = String(form.get("shortProfile") || "").trim() || null;
  const address = String(form.get("address") || "").trim() || null;
  const capacity = String(form.get("capacity") || "").trim() || null;

  const yearOperation = parseOptionalNumber(String(form.get("yearOperation") || ""));
  const lineCount = parseOptionalNumber(String(form.get("lineCount") || ""));

  const operationalNotes = String(form.get("operationalNotes") || "").trim() || null;

  const photo = form.get("photo");
  const structure = form.get("structure");
  const certificate = form.get("certificate");

  let photoUrl: string | null = null;
  let structureUrl: string | null = null;
  let certificateUrl: string | null = null;

  try {
    if (photo instanceof File && photo.size > 0)
      photoUrl = await uploadImage(photo, `unit/${type}/${slug}/photo`);

    if (structure instanceof File && structure.size > 0)
      structureUrl = await uploadImage(structure, `unit/${type}/${slug}/structure`);

    if (certificate instanceof File && certificate.size > 0)
      certificateUrl = await uploadImage(certificate, `unit/${type}/${slug}/certificate`);
  } catch (e: any) {
    if (e?.message === "IMAGE_ONLY") return bad("File harus image PNG/JPG/WEBP");
    if (e?.message === "IMAGE_TOO_BIG") return bad("Max image 10MB");
    if (e?.message === "NO_BLOB_TOKEN") return bad("Env BLOB_READ_WRITE_TOKEN belum ada");
    return bad("Upload gagal");
  }

  const payload = {
    name,
    slug,
    shortProfile,
    address,
    capacity,
    yearOperation,
    lineCount,
    operationalNotes,
    photoUrl,
    structureUrl,
    certificateUrl,
  };

  try {
    const created =
      type === "pks"
        ? await prisma.pks.create({ data: payload })
        : type === "ppis"
        ? await prisma.ppis.create({ data: payload })
        : await prisma.ppkr.create({ data: payload });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") return bad("Slug sudah dipakai", 400);
    return bad(e?.message ?? "Gagal simpan", 400);
  }
}

/* ======================================================
   PATCH
====================================================== */
export async function PATCH(req: NextRequest, { params }: { params: Record<string, any> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const type = resolveType(req, params);
  if (!type) return bad("Invalid type");

  const form = await req.formData();
  const id = String(form.get("id") || "").trim();
  if (!id) return bad("id is required");

  const existing =
    type === "pks"
      ? await prisma.pks.findUnique({ where: { id } })
      : type === "ppis"
      ? await prisma.ppis.findUnique({ where: { id } })
      : await prisma.ppkr.findUnique({ where: { id } });

  if (!existing) return bad("Data tidak ditemukan", 404);

  // ✅ name optional, tapi kalau dikirim harus non-empty (TIDAK PERNAH null)
  const nameRaw = form.has("name") ? String(form.get("name") || "").trim() : undefined;
  if (nameRaw !== undefined && !nameRaw) return bad("name is required");

  // ✅ slug optional, kalau dikirim harus non-empty
  const slugRaw = form.has("slug") ? String(form.get("slug") || "").trim() : undefined;
  if (slugRaw !== undefined && !slugRaw) return bad("slug is required");
  const slug = slugRaw ? slugify(slugRaw) : undefined;

  // ✅ nullable fields: kalau dikirim kosong -> null, kalau tidak dikirim -> undefined (tidak diubah)
  const shortProfile = form.has("shortProfile")
    ? (String(form.get("shortProfile") || "").trim() || null)
    : undefined;

  const address = form.has("address")
    ? (String(form.get("address") || "").trim() || null)
    : undefined;

  const capacity = form.has("capacity")
    ? (String(form.get("capacity") || "").trim() || null)
    : undefined;

  const yearOperation = form.has("yearOperation")
    ? parseOptionalNumber(String(form.get("yearOperation") || ""))
    : undefined;

  const lineCount = form.has("lineCount")
    ? parseOptionalNumber(String(form.get("lineCount") || ""))
    : undefined;

  const operationalNotes = form.has("operationalNotes")
    ? (String(form.get("operationalNotes") || "").trim() || null)
    : undefined;

  const photo = form.get("photo");
  const structure = form.get("structure");
  const certificate = form.get("certificate");

  let newPhotoUrl: string | undefined;
  let newStructureUrl: string | undefined;
  let newCertificateUrl: string | undefined;

  try {
    const baseSlug = slug ?? existing.slug;

    if (photo instanceof File && photo.size > 0)
      newPhotoUrl = await uploadImage(photo, `unit/${type}/${baseSlug}/photo`);

    if (structure instanceof File && structure.size > 0)
      newStructureUrl = await uploadImage(structure, `unit/${type}/${baseSlug}/structure`);

    if (certificate instanceof File && certificate.size > 0)
      newCertificateUrl = await uploadImage(certificate, `unit/${type}/${baseSlug}/certificate`);
  } catch (e: any) {
    if (e?.message === "IMAGE_ONLY") return bad("File harus image PNG/JPG/WEBP");
    if (e?.message === "IMAGE_TOO_BIG") return bad("Max image 10MB");
    if (e?.message === "NO_BLOB_TOKEN") return bad("Env BLOB_READ_WRITE_TOKEN belum ada");
    return bad("Upload gagal");
  }

  // ✅ INI KUNCI: name selalu string (kalau ada)
  const data = {
    ...(nameRaw !== undefined ? { name: nameRaw } : {}),
    ...(slug !== undefined ? { slug } : {}),
    ...(shortProfile !== undefined ? { shortProfile } : {}),
    ...(address !== undefined ? { address } : {}),
    ...(capacity !== undefined ? { capacity } : {}),
    ...(yearOperation !== undefined ? { yearOperation } : {}),
    ...(lineCount !== undefined ? { lineCount } : {}),
    ...(operationalNotes !== undefined ? { operationalNotes } : {}),
    ...(newPhotoUrl ? { photoUrl: newPhotoUrl } : {}),
    ...(newStructureUrl ? { structureUrl: newStructureUrl } : {}),
    ...(newCertificateUrl ? { certificateUrl: newCertificateUrl } : {}),
  };

  try {
    const updated =
      type === "pks"
        ? await prisma.pks.update({ where: { id }, data })
        : type === "ppis"
        ? await prisma.ppis.update({ where: { id }, data })
        : await prisma.ppkr.update({ where: { id }, data });

    return NextResponse.json(updated);
  } catch (e: any) {
    if (e?.code === "P2002") return bad("Slug sudah dipakai", 400);
    return bad(e?.message ?? "Gagal update", 400);
  }
}

/* ======================================================
   DELETE
====================================================== */
export async function DELETE(req: NextRequest, { params }: { params: Record<string, any> }) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const type = resolveType(req, params);
  if (!type) return bad("Invalid type");

  const { searchParams } = new URL(req.url);
  const id = String(searchParams.get("id") || "").trim();
  if (!id) return bad("id is required");

  try {
    const deleted =
      type === "pks"
        ? await prisma.pks.delete({ where: { id } })
        : type === "ppis"
        ? await prisma.ppis.delete({ where: { id } })
        : await prisma.ppkr.delete({ where: { id } });

    return NextResponse.json({ ok: true, id: deleted.id });
  } catch (e: any) {
    return bad(e?.message ?? "Gagal hapus", 400);
  }
}