import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/lib/admin";
import { writeAuditLog } from "@/lib/audit";
import { deletePublicUploadByUrl, savePublicUpload } from "@/lib/upload";
import { z } from "zod";

export const runtime = "nodejs";

const CreateSchema = z.object({
  title: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  category: z.string().optional().nullable(), 
  order: z.coerce.number().int().optional(),
  isVisible: z.coerce.boolean().optional(),
});

const UpdateSchema = CreateSchema.partial();

function jsonError(status: number, message: string, extra?: unknown) {
  return NextResponse.json(
    { error: status >= 500 ? "Internal Server Error" : "Bad Request", message, extra },
    { status }
  );
}

function normText(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t : null;
}

export async function GET() {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const data = await prisma.gallery.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const actorId = guard.session.user?.id ?? null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  const form = await req.formData();
  const file = form.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return jsonError(400, "Field 'image' wajib diisi (file gambar).");
  }

  const parsed = CreateSchema.safeParse({
    title: form.get("title"),
    caption: form.get("caption"),
    order: form.get("order"),
    category: form.get("category"),
    isVisible: form.get("isVisible"),
  });
  if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

  const uploaded = await savePublicUpload(file, "gallery");

  try {
const created = await prisma.gallery.create({
  data: {
    title: normText(parsed.data.title),
    caption: normText(parsed.data.caption),
    category: normText(parsed.data.category), 
    order: parsed.data.order ?? 0,
    isVisible: parsed.data.isVisible ?? true,
    imageUrl: uploaded.urlPath,
  },
});

    await writeAuditLog({
      action: "CREATE_GALLERY",
      entity: "Gallery",
      entityId: created.id,
      actorId,
      actorEmail,
      meta: { after: created },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    await deletePublicUploadByUrl(uploaded.urlPath);
    return jsonError(500, "Gagal membuat item galeri.", String(e));
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

  const before = await prisma.gallery.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData();
  const nextFile = form.get("image");

  const parsed = UpdateSchema.safeParse({
    title: form.get("title"),
    caption: form.get("caption"),
    category: form.get("category"), 
    order: form.get("order"),
    isVisible: form.get("isVisible"),
  });
  if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

  let newImageUrl: string | undefined;
  if (nextFile instanceof File && nextFile.size > 0) {
    const uploaded = await savePublicUpload(nextFile, "gallery");
    newImageUrl = uploaded.urlPath;
  }

const data: any = {};
if (parsed.data.title !== undefined) data.title = normText(parsed.data.title);
if (parsed.data.caption !== undefined) data.caption = normText(parsed.data.caption);
if (parsed.data.category !== undefined) data.category = normText(parsed.data.category); // ✅ TAMBAH
if (parsed.data.order !== undefined) data.order = parsed.data.order;
if (parsed.data.isVisible !== undefined) data.isVisible = parsed.data.isVisible;
if (newImageUrl) data.imageUrl = newImageUrl;

  try {
    const updated = await prisma.gallery.update({ where: { id }, data });

    if (newImageUrl) {
      await deletePublicUploadByUrl(before.imageUrl);
    }

    await writeAuditLog({
      action: "UPDATE_GALLERY",
      entity: "Gallery",
      entityId: id,
      actorId,
      actorEmail,
      meta: { before, after: updated },
    });

    return NextResponse.json(updated);
  } catch (e) {
    if (newImageUrl) await deletePublicUploadByUrl(newImageUrl);
    return jsonError(500, "Gagal update galeri.", String(e));
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

  const before = await prisma.gallery.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await prisma.gallery.delete({ where: { id } });
    await deletePublicUploadByUrl(before.imageUrl);

    await writeAuditLog({
      action: "DELETE_GALLERY",
      entity: "Gallery",
      entityId: id,
      actorId,
      actorEmail,
      meta: { before },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return jsonError(500, "Gagal delete galeri.", String(e));
  }
}
