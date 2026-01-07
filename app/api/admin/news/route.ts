import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/lib/admin";
import { writeAuditLog } from "@/lib/audit";
import { deletePublicUploadByUrl, savePublicUpload } from "@/lib/upload";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

async function resolveActor(guard: any) {
  const sessionUserId = (guard.session.user?.id ?? null) as string | null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  let actorId: string | null = null;

  if (sessionUserId) {
    const u = await prisma.user.findUnique({ where: { id: sessionUserId }, select: { id: true } });
    if (u?.id) actorId = u.id;
  }

  if (!actorId && actorEmail) {
    const u = await prisma.user.findUnique({ where: { email: actorEmail }, select: { id: true } });
    if (u?.id) actorId = u.id;
  }

  return { actorId, actorEmail, sessionUserId };
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

  const { actorId, actorEmail, sessionUserId } = await resolveActor(guard);
  if (!actorId) {
    return jsonError(401, "Session user tidak valid / user tidak ditemukan di database.", {
      sessionUserId,
      actorEmail,
    });
  }

  let coverUrl: string | null = null;

  try {
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

    if (cover && typeof cover === "object" && cover.size > 0) {
      const MAX = 2 * 1024 * 1024; // 2MB
      if (cover.size > MAX) return jsonError(400, "Ukuran cover maksimal 2MB.");

      const saved = await savePublicUpload(cover, "news");
      coverUrl = saved.urlPath; // FULL URL blob
    }

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
  } catch (e: any) {
    console.error("CREATE_NEWS ERROR:", e);

    if (coverUrl) await deletePublicUploadByUrl(coverUrl);

    return jsonError(500, "Gagal membuat berita.", e?.message ?? String(e));
  }
}

// =======================
// PATCH: update news (admin)
// =======================
export async function PATCH(req: NextRequest) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const { actorId, actorEmail, sessionUserId } = await resolveActor(guard);
  if (!actorId) {
    return jsonError(401, "Session user tidak valid / user tidak ditemukan di database.", {
      sessionUserId,
      actorEmail,
    });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return jsonError(400, "Parameter 'id' wajib.");

  const existing = await prisma.news.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true, excerpt: true, content: true, coverImageUrl: true },
  });
  if (!existing) return jsonError(404, "News tidak ditemukan.");

  let newCoverUrl: string | null | undefined = undefined;

  try {
    const fd = await req.formData();

    const title = fd.get("title") ? String(fd.get("title")) : undefined;
    const excerpt = fd.get("excerpt") ? String(fd.get("excerpt")) : undefined;
    const content = fd.get("content") ? String(fd.get("content")) : undefined;

    // checkbox bisa tricky; kita handle robust:
    const isPublishedRaw = fd.get("isPublished");
    const isPublished =
      isPublishedRaw === null ? undefined : String(isPublishedRaw) === "true" || String(isPublishedRaw) === "1";

    const publishedAt = fd.get("publishedAt") ? String(fd.get("publishedAt")) : undefined;

    const cover = fd.get("cover") as File | null;
    if (cover && cover.size > 0) {
      const MAX = 2 * 1024 * 1024;
      if (cover.size > MAX) return jsonError(400, "Ukuran cover maksimal 2MB.");

      const saved = await savePublicUpload(cover, "news");
      newCoverUrl = saved.urlPath;
    }

    let newSlug: string | undefined = undefined;
    if (title && title.trim() && title.trim() !== existing.title) {
      newSlug = await uniqueSlug(title);
    }

    const updated = await prisma.news.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(newSlug !== undefined ? { slug: newSlug } : {}),
        ...(excerpt !== undefined ? { excerpt: excerpt.trim() ? excerpt.trim() : null } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(newCoverUrl !== undefined ? { coverImageUrl: newCoverUrl } : {}),
        ...(isPublished !== undefined ? { isPublished } : {}),
        ...(publishedAt !== undefined ? { publishedAt: publishedAt ? new Date(publishedAt) : null } : {}),
      },
    });

    // kalau cover diganti, hapus cover lama
    if (newCoverUrl && existing.coverImageUrl) {
      await deletePublicUploadByUrl(existing.coverImageUrl);
    }

    await writeAuditLog({
      action: "UPDATE_NEWS",
      entity: "News",
      entityId: updated.id,
      actorId,
      actorEmail,
      meta: { before: existing, after: updated },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("UPDATE_NEWS ERROR:", e);

    // kalau cover baru sudah keupload tapi update gagal
    if (newCoverUrl) await deletePublicUploadByUrl(newCoverUrl);

    return jsonError(500, "Gagal update berita.", e?.message ?? String(e));
  }
}

// =======================
// DELETE: delete news (admin)
// =======================
export async function DELETE(req: NextRequest) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const { actorId, actorEmail, sessionUserId } = await resolveActor(guard);
  if (!actorId) {
    return jsonError(401, "Session user tidak valid / user tidak ditemukan di database.", {
      sessionUserId,
      actorEmail,
    });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return jsonError(400, "Parameter 'id' wajib.");

  const existing = await prisma.news.findUnique({
    where: { id },
    select: { id: true, coverImageUrl: true },
  });
  if (!existing) return jsonError(404, "News tidak ditemukan.");

  try {
    await prisma.news.delete({ where: { id } });

    if (existing.coverImageUrl) {
      await deletePublicUploadByUrl(existing.coverImageUrl);
    }

    await writeAuditLog({
      action: "DELETE_NEWS",
      entity: "News",
      entityId: id,
      actorId,
      actorEmail,
      meta: { before: existing },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE_NEWS ERROR:", e);
    return jsonError(500, "Gagal hapus berita.", e?.message ?? String(e));
  }
}
