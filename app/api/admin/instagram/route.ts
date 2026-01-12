import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { writeAuditLog } from "@/lib/audit";
import { Prisma, NewsSource } from "@prisma/client";
import { z } from "zod";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(status: number, message: string, extra?: unknown) {
  return NextResponse.json(
    { error: status >= 500 ? "Internal Server Error" : "Bad Request", message, extra },
    { status }
  );
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function normText(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
}

function normBool(v: FormDataEntryValue | null): boolean {
  if (typeof v !== "string") return false;
  return v === "true" || v === "1" || v === "on";
}

function normISODate(v: FormDataEntryValue | null): Date | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  const d = new Date(t);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function parseInstagramUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "instagram.com" && host !== "instagr.am") return null;

    // allow: /p/xxx/ , /reel/xxx/ , /tv/xxx/
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    const kind = parts[0];
    const code = parts[1];
    if (!code) return null;

    if (kind !== "p" && kind !== "reel" && kind !== "tv") return null;

    return `https://www.instagram.com/${kind}/${code}/`;
  } catch {
    return null;
  }
}

async function uploadCoverToBlob(file: File) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("Env BLOB_READ_WRITE_TOKEN belum ada (set di .env lokal dan Vercel).");
  }
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const safeExt = ext || "jpg";
  const path = `instagram/${Date.now()}-${Math.random().toString(16).slice(2)}.${safeExt}`;
  const blob = await put(path, file, { access: "public", token });
  return blob.url;
}

async function resolveAuthorId(actorId: string | null, actorEmail: string | null) {
  if (actorId) {
    const byId = await prisma.user.findUnique({ where: { id: actorId } });
    if (byId) return byId.id;
  }
  if (actorEmail) {
    const byEmail = await prisma.user.findUnique({ where: { email: actorEmail } });
    if (byEmail) return byEmail.id;
  }
  return null;
}

// ---------------- GET ----------------
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const items = await prisma.news.findMany({
    where: { sourceType: NewsSource.INSTAGRAM },
    orderBy: [{ createdAt: "desc" }],
  });

  return NextResponse.json(items);
}

// ---------------- POST ----------------
const CreateSchema = z.object({
  title: z.string().min(1),
  instagramUrl: z.string().min(1),
  isPublished: z.boolean().optional(),
  publishedAt: z.date().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const actorId = (guard.session.user?.id ?? null) as string | null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  try {
    const fd = await req.formData();

    const title = normText(fd.get("title"));
    const instagramUrlRaw = normText(fd.get("instagramUrl"));
    const isPublished = normBool(fd.get("isPublished"));
    const publishedAt = normISODate(fd.get("publishedAt"));

    const parsed = CreateSchema.safeParse({
      title: title ?? "",
      instagramUrl: instagramUrlRaw ?? "",
      isPublished,
      publishedAt,
    });
    if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

    const canonical = parseInstagramUrl(parsed.data.instagramUrl);
    if (!canonical) {
      return jsonError(400, "Link Instagram tidak valid. Contoh: https://www.instagram.com/reel/XXXX/");
    }

    const coverEntry = fd.get("cover");
    let coverImageUrl: string | null = null;
    if (coverEntry instanceof File && coverEntry.size > 0) {
      coverImageUrl = await uploadCoverToBlob(coverEntry);
    }

    const baseSlug = slugify(parsed.data.title);
    let slug = baseSlug || `ig-${Date.now()}`;
    for (let i = 0; i < 10; i++) {
      const exists = await prisma.news.findUnique({ where: { slug } });
      if (!exists) break;
      slug = `${baseSlug}-${i + 2}`;
    }

    const authorId = await resolveAuthorId(actorId, actorEmail);

    const created = await prisma.news.create({
      data: {
        title: parsed.data.title.trim(),
        slug,
        excerpt: null,
        content: "[INSTAGRAM]",
        coverImageUrl,
        isPublished: !!parsed.data.isPublished,
        publishedAt: parsed.data.isPublished ? (parsed.data.publishedAt ?? new Date()) : null,
        authorId,

        sourceType: NewsSource.INSTAGRAM,
        instagramUrl: canonical,
      },
    });

    await writeAuditLog({
      action: "CREATE_INSTAGRAM",
      entity: "News",
      entityId: created.id,
      actorId,
      actorEmail,
      meta: { after: created },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return jsonError(500, "Gagal membuat Instagram.", String(e?.message ?? e));
  }
}

// ---------------- PATCH ----------------
export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const actorId = (guard.session.user?.id ?? null) as string | null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  if (!id) return jsonError(400, "Missing query param: id");

  const before = await prisma.news.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (before.sourceType !== NewsSource.INSTAGRAM) return jsonError(400, "Item ini bukan Instagram.");

  try {
    const fd = await req.formData();

    const title = normText(fd.get("title")) ?? before.title;
    const instagramUrlRaw = fd.has("instagramUrl") ? normText(fd.get("instagramUrl")) : before.instagramUrl;
    const isPublished = fd.has("isPublished") ? normBool(fd.get("isPublished")) : before.isPublished;
    const publishedAt = fd.has("publishedAt") ? normISODate(fd.get("publishedAt")) : (before.publishedAt ?? null);
    const removeCover = normBool(fd.get("removeCover"));

    let canonical = before.instagramUrl;
    if (instagramUrlRaw) {
      const parsedUrl = parseInstagramUrl(instagramUrlRaw);
      if (!parsedUrl) return jsonError(400, "Link Instagram tidak valid.");
      canonical = parsedUrl;
    } else {
      return jsonError(400, "Link Instagram wajib diisi.");
    }

    const coverEntry = fd.get("cover");
    let coverImageUrl: string | null | undefined = undefined;
    if (coverEntry instanceof File && coverEntry.size > 0) {
      coverImageUrl = await uploadCoverToBlob(coverEntry);
    } else if (removeCover) {
      coverImageUrl = null;
    }

    const data: Prisma.NewsUpdateInput = {
      title: title.trim(),
      instagramUrl: canonical,
      isPublished,
      publishedAt: isPublished ? (publishedAt ?? new Date()) : null,
      sourceType: NewsSource.INSTAGRAM,
      content: "[INSTAGRAM]",
      excerpt: null,
    };

    if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl;

    if (title.trim() !== before.title.trim()) {
      const newSlugBase = slugify(title);
      let newSlug = newSlugBase || before.slug;

      for (let i = 0; i < 10; i++) {
        const exists = await prisma.news.findFirst({ where: { slug: newSlug, NOT: { id } } });
        if (!exists) break;
        newSlug = `${newSlugBase}-${i + 2}`;
      }

      data.slug = newSlug;
    }

    const updated = await prisma.news.update({ where: { id }, data });

    await writeAuditLog({
      action: "UPDATE_INSTAGRAM",
      entity: "News",
      entityId: id,
      actorId,
      actorEmail,
      meta: { before, after: updated },
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    return jsonError(500, "Gagal update Instagram.", String(e?.message ?? e));
  }
}

// ---------------- DELETE ----------------
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const actorId = (guard.session.user?.id ?? null) as string | null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  if (!id) return jsonError(400, "Missing query param: id");

  const before = await prisma.news.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (before.sourceType !== NewsSource.INSTAGRAM) return jsonError(400, "Item ini bukan Instagram.");

  try {
    await prisma.news.delete({ where: { id } });

    await writeAuditLog({
      action: "DELETE_INSTAGRAM",
      entity: "News",
      entityId: id,
      actorId,
      actorEmail,
      meta: { before },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return jsonError(500, "Gagal hapus Instagram.", String(e?.message ?? e));
  }
}
