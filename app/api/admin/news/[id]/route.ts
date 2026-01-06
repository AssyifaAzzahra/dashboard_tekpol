import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/lib/admin";
import { writeAuditLog } from "@/lib/audit";
import { deletePublicUploadByUrl, savePublicUpload } from "@/lib/upload";
import { z } from "zod";

export const runtime = "nodejs";

/* ================== UTIL ================== */
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

async function uniqueSlug(base: string, excludeId?: string) {
  const clean = slugify(base) || "post";
  let slug = clean;
  let i = 1;

  while (true) {
    const found = await prisma.news.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (!found) return slug;
    slug = `${clean}-${++i}`;
  }
}

/* ================== SCHEMA ================== */
const UpdateSchema = z.object({
  title: z.string().min(1).optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(1).optional(),
  isPublished: z.coerce.boolean().optional(),
  publishedAt: z.string().optional().nullable(),
  removeCover: z.coerce.boolean().optional(),
});

/* =========================================================
   NEXT 16 VALIDATOR EXPECTS:
   context: { params: Promise<{ id: string }> }
   ========================================================= */

/* ================== PATCH ================== */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const actorId = guard.session.user?.id ?? null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  const { id } = await context.params;
  const safeId = (id || "").trim();
  if (!safeId) return jsonError(400, "Missing param: id");

  const before = await prisma.news.findUnique({ where: { id: safeId } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fd = await req.formData();
  const raw = {
    title: fd.get("title") ? String(fd.get("title")) : undefined,
    excerpt:
      fd.get("excerpt") === null
        ? undefined
        : fd.get("excerpt")
        ? String(fd.get("excerpt"))
        : null,
    content: fd.get("content") ? String(fd.get("content")) : undefined,
    isPublished: fd.get("isPublished") ?? undefined,
    publishedAt:
      fd.get("publishedAt") === null
        ? undefined
        : fd.get("publishedAt")
        ? String(fd.get("publishedAt"))
        : null,
    removeCover: fd.get("removeCover") ?? undefined,
  };

  const parsed = UpdateSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

  const cover = fd.get("cover") as File | null;
  let newCoverUrl: string | null | undefined = undefined;

  if (cover && typeof cover === "object" && cover.size > 0) {
    const saved = await savePublicUpload(cover, "news");
    newCoverUrl = saved.urlPath;
  }

  try {
    const data: any = {};

    if (parsed.data.title !== undefined) {
      data.title = parsed.data.title;
      data.slug = await uniqueSlug(parsed.data.title, safeId);
    }

    if (parsed.data.excerpt !== undefined) {
      data.excerpt =
        parsed.data.excerpt === null
          ? null
          : parsed.data.excerpt.trim()
          ? parsed.data.excerpt.trim()
          : null;
    }

    if (parsed.data.content !== undefined) data.content = parsed.data.content;
    if (parsed.data.isPublished !== undefined) data.isPublished = parsed.data.isPublished;

    if (parsed.data.publishedAt !== undefined) {
      data.publishedAt = parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : null;
    }

    if (parsed.data.removeCover) data.coverImageUrl = null;
    if (newCoverUrl !== undefined) data.coverImageUrl = newCoverUrl;

    const updated = await prisma.news.update({ where: { id: safeId }, data });

    if ((newCoverUrl !== undefined || parsed.data.removeCover) && before.coverImageUrl) {
      await deletePublicUploadByUrl(before.coverImageUrl);
    }

    await writeAuditLog({
      action: "UPDATE_NEWS",
      entity: "News",
      entityId: safeId,
      actorId,
      actorEmail,
      meta: { before, after: updated },
    });

    return NextResponse.json(updated);
  } catch (e) {
    if (newCoverUrl) await deletePublicUploadByUrl(newCoverUrl);
    return jsonError(500, "Gagal update berita.", String(e));
  }
}

/* ================== DELETE ================== */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const actorId = guard.session.user?.id ?? null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  const { id } = await context.params;
  const safeId = (id || "").trim();
  if (!safeId) return jsonError(400, "Missing param: id");

  const before = await prisma.news.findUnique({ where: { id: safeId } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await prisma.news.delete({ where: { id: safeId } });
    if (before.coverImageUrl) await deletePublicUploadByUrl(before.coverImageUrl);

    await writeAuditLog({
      action: "DELETE_NEWS",
      entity: "News",
      entityId: safeId,
      actorId,
      actorEmail,
      meta: { before },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError(500, "Gagal hapus berita.", String(e));
  }
}
