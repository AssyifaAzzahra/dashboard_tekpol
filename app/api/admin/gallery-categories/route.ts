// app/api/admin/gallery-categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/lib/admin";
import { writeAuditLog } from "@/lib/audit";
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

async function uniqueSlug(base: string, excludeId?: string) {
  const clean = slugify(base) || "kategori";
  let slug = clean;
  let i = 1;

  while (true) {
    const found = await prisma.galleryCategory.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    });
    if (!found) return slug;
    i += 1;
    slug = `${clean}-${i}`;
  }
}

const CreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(), // ✅ biar kompatibel kalau UI kirim slug
  order: z.coerce.number().int().optional().default(0),
  isActive: z.coerce.boolean().optional().default(true),
});

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  order: z.coerce.number().int().optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all") === "1";

  const data = await prisma.galleryCategory.findMany({
    where: all ? {} : { isActive: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const actorId = guard.session.user?.id ?? null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  const body = await req.json().catch(() => null);
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

  try {
    const name = parsed.data.name.trim();
    const base = parsed.data.slug?.trim() ? parsed.data.slug.trim() : name;
    const slug = await uniqueSlug(base);

    const created = await prisma.galleryCategory.create({
      data: {
        name,
        slug,
        order: parsed.data.order ?? 0,
        isActive: parsed.data.isActive ?? true,
      },
    });

    await writeAuditLog({
      action: "CREATE_GALLERY_CATEGORY",
      entity: "GalleryCategory",
      entityId: created.id,
      actorId,
      actorEmail,
      meta: { after: created },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return jsonError(500, "Gagal membuat kategori.", String(e));
  }
}

export async function PATCH(req: NextRequest) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const actorId = guard.session.user?.id ?? null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  if (!id) return jsonError(400, "Missing query param: id");

  const before = await prisma.galleryCategory.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

  try {
    const data: any = {};
    if (parsed.data.name !== undefined) {
      data.name = parsed.data.name.trim();
      data.slug = await uniqueSlug(parsed.data.name, id);
    }
    if (parsed.data.order !== undefined) data.order = parsed.data.order;
    if (parsed.data.isActive !== undefined) data.isActive = parsed.data.isActive;

    const updated = await prisma.galleryCategory.update({ where: { id }, data });

    await writeAuditLog({
      action: "UPDATE_GALLERY_CATEGORY",
      entity: "GalleryCategory",
      entityId: id,
      actorId,
      actorEmail,
      meta: { before, after: updated },
    });

    return NextResponse.json(updated);
  } catch (e) {
    return jsonError(500, "Gagal update kategori.", String(e));
  }
}

export async function DELETE(req: NextRequest) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const actorId = guard.session.user?.id ?? null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  if (!id) return jsonError(400, "Missing query param: id");

  const before = await prisma.galleryCategory.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    // ✅ aman: kalau kategori masih dipakai galeri, tolak
    const used = await prisma.gallery.count({ where: { category: before.name } });
    if (used > 0) {
      return jsonError(
        400,
        `Kategori masih dipakai oleh ${used} item galeri. Nonaktifkan saja (isActive=false) atau ganti kategorinya dulu.`
      );
    }

    await prisma.galleryCategory.delete({ where: { id } });

    await writeAuditLog({
      action: "DELETE_GALLERY_CATEGORY",
      entity: "GalleryCategory",
      entityId: id,
      actorId,
      actorEmail,
      meta: { before },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError(500, "Gagal hapus kategori.", String(e));
  }
}
