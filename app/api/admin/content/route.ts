import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContentBucketSchema } from "@/lib/validators/content";
import { requireAdmin } from "@/lib/admin";
import { TEKPOL_CONTENT_MAP } from "@/lib/constants/tekpol-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(status: number, message: string, extra?: unknown) {
  return NextResponse.json({ error: message, extra }, { status });
}

/**
 * GET /api/admin/content?key=...
 * - DB first
 * - kalau null → fallback constants (biar admin page langsung ada data)
 */
export async function GET(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const { searchParams } = new URL(req.url);
  const key = (searchParams.get("key") || "").trim();
  if (!key) return jsonError(400, "Missing key");

  const row = await prisma.contentSection.findUnique({ where: { key } });

  // ✅ kalau ada di DB
  if (row) {
    return NextResponse.json({
      from: "db",
      key: row.key,
      title: row.title,
      content: row.content,
      updatedAt: row.updatedAt,
      createdAt: row.createdAt,
    });
  }

  // ✅ fallback dari constants
  const fallback = TEKPOL_CONTENT_MAP[key];
  if (!fallback) return jsonError(404, "Unknown key");

  // validasi fallback biar aman
  const parsed = ContentBucketSchema.safeParse(fallback);
  if (!parsed.success) {
    return jsonError(500, "Fallback content invalid (cek constants)", parsed.error);
  }

  return NextResponse.json({
    from: "fallback",
    key,
    title: fallback.title,
    content: parsed.data,
  });
}

/**
 * POST /api/admin/content
 * body: { key, title, content }
 * - content wajib sesuai schema
 * - kalau content kosong → ambil fallback (opsional)
 */
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const body = await req.json().catch(() => null);
  if (!body) return jsonError(400, "Invalid JSON");

  const key = String(body.key || "").trim();
  const title = String(body.title || "").trim();
  let content = body.content;

  if (!key) return jsonError(400, "key wajib ada");
  if (!title) return jsonError(400, "title wajib ada");

  // ✅ kalau content tidak dikirim, pakai fallback constants
  if (!content) {
    const fallback = TEKPOL_CONTENT_MAP[key];
    if (!fallback) return jsonError(400, "content kosong dan fallback tidak ditemukan untuk key ini");
    content = fallback;
  }

  const parsed = ContentBucketSchema.safeParse(content);
  if (!parsed.success) {
    return jsonError(400, "Format content tidak valid", parsed.error);
  }

  const saved = await prisma.contentSection.upsert({
    where: { key },
    create: { key, title, content: parsed.data },
    update: { title, content: parsed.data },
  });

  return NextResponse.json({
    ok: true,
    from: "db",
    key: saved.key,
    title: saved.title,
    content: saved.content,
    updatedAt: saved.updatedAt,
    createdAt: saved.createdAt,
  });
}