import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/lib/admin";
import { writeAuditLog } from "@/lib/audit";
import { deletePublicUploadByUrl, savePublicUpload } from "@/lib/upload";
import { z } from "zod";

export const runtime = "nodejs";

function jsonError(status: number, message: string, extra?: unknown) {
  return NextResponse.json(
    { error: status >= 500 ? "Internal Server Error" : "Bad Request", message, extra },
    { status }
  );
}

function slugify(input: string) {
  return (input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function uniqueSlug(base: string) {
  const clean = slugify(base) || "post";
  let slug = clean;
  let i = 1;

  while (true) {
    const found = await prisma.news.findFirst({
      where: { slug },
      select: { id: true },
    });
    if (!found) return slug;
    i += 1;
    slug = `${clean}-${i}`;
  }
}

const CreateSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  isPublished: z.coerce.boolean().optional().default(false),
  publishedAt: z.string().optional(), // ISO / datetime-local
});

// =======================
// GET: list news (admin)
// =======================
export async function GET() {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const data = await prisma.news.findMany({
    orderBy: [{ createdAt: "desc" }],
  });

  return NextResponse.json(data);
}

// =======================
// POST: create news (admin)
// =======================
export async function POST(req: NextRequest) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  // === ambil identitas aktor dari session ===
  const sessionUserId = (guard.session.user?.id ?? null) as string | null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  // ✅ FIX: pastikan actorId valid dan ada di DB
  let actorId: string | null = null;

  // 1) kalau session punya user.id → validasi ke DB
  if (sessionUserId) {
    const u = await prisma.user.findUnique({ where: { id: sessionUserId }, select: { id: true } });
    if (u?.id) actorId = u.id;
  }

  // 2) fallback: kalau id kosong / tidak ketemu → cari via email
  if (!actorId && actorEmail) {
    const u = await prisma.user.findUnique({ where: { email: actorEmail }, select: { id: true } });
    if (u?.id) actorId = u.id;
  }

  // 3) kalau masih null → stop (ini yang bikin FK error sebelumnya)
  if (!actorId) {
    return jsonError(
      401,
      "Session user tidak valid / user tidak ditemukan di database. Pastikan user login tersimpan di tabel User (id/email cocok).",
      { sessionUserId, actorEmail }
    );
  }

  const fd = await req.formData();
  const raw = {
    title: String(fd.get("title") ?? ""),
    excerpt: fd.get("excerpt") ? String(fd.get("excerpt")) : undefined,
    content: String(fd.get("content") ?? ""),
    isPublished: fd.get("isPublished") ?? undefined,
    publishedAt: fd.get("publishedAt") ? String(fd.get("publishedAt")) : undefined,
  };

  const parsed = CreateSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

  const cover = fd.get("cover") as File | null;
  let coverUrl: string | null = null;

  if (cover && typeof cover === "object" && cover.size > 0) {
    const saved = await savePublicUpload(cover, "news");
    coverUrl = saved.urlPath;
  }

  try {
    const slug = await uniqueSlug(parsed.data.title);

    const created = await prisma.news.create({
      data: {
        title: parsed.data.title,
        slug,
        excerpt: parsed.data.excerpt?.trim() ? parsed.data.excerpt.trim() : null,
        content: parsed.data.content,
        coverImageUrl: coverUrl,
        isPublished: parsed.data.isPublished ?? false,
        publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null,

        // ✅ FIX UTAMA: selalu valid userId
        authorId: actorId,
      },
    });

    await writeAuditLog({
      action: "CREATE_NEWS",
      entity: "News",
      entityId: created.id,
      actorId,
      actorEmail,
      meta: { after: created },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (coverUrl) await deletePublicUploadByUrl(coverUrl);
    return jsonError(500, "Gagal membuat berita.", String(e));
  }
}
