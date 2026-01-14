// app/api/admin/apps/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/lib/admin";
import { z } from "zod";
import { writeAuditLog } from "@/lib/audit";
import { Prisma } from "@prisma/client";
import { deletePublicUploadByUrl, savePublicUpload } from "@/lib/upload";

export const runtime = "nodejs";

const CreateSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["HO", "REGIONAL"]),
  url: z.string().optional().nullable(),

  // ✅ sekarang opsional
  username: z.string().optional().nullable(),
  password: z.string().optional().nullable(),

  description: z.string().optional().nullable(),
});

const UpdateSchema = CreateSchema.partial();

function jsonError(status: number, message: string, extra?: unknown) {
  return NextResponse.json(
    { error: status >= 500 ? "Internal Server Error" : "Bad Request", message, extra },
    { status }
  );
}

function normalizeDescription(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t : null;
}

function normalizeOptionalString(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t : null;
}

function normalizeUrl(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v !== "string") return undefined;

  const t = v.trim();
  if (!t) return null;

  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;
  try {
    // eslint-disable-next-line no-new
    new URL(withProto);
    return withProto;
  } catch {
    return withProto;
  }
}

// ------------ GET (list) ------------
export async function GET() {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const data = await prisma.app.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(data);
}

// ------------ POST (create) ------------
export async function POST(req: NextRequest) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const actorId = guard.session.user?.id ?? null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  const form = await req.formData();

  const parsed = CreateSchema.safeParse({
    name: form.get("name"),
    category: form.get("category"),
    url: form.get("url"),
    username: form.get("username"),
    password: form.get("password"),
    description: form.get("description"),
  });

  if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

  const logoFile = form.get("logo");
  let uploadedLogoUrl: string | null = null;

  if (logoFile instanceof File && logoFile.size > 0) {
    const uploaded = await savePublicUpload(logoFile, "apps");
    uploadedLogoUrl = uploaded.urlPath; // contoh: /uploads/apps/xxx.png
  }

  try {
    const created = await prisma.app.create({
      data: {
        name: parsed.data.name,
        category: parsed.data.category,
        url: normalizeUrl(parsed.data.url),

        // ✅ opsional, kosong jadi null
        username: normalizeOptionalString(parsed.data.username),
        password: normalizeOptionalString(parsed.data.password),

        description: normalizeDescription(parsed.data.description),
        logoUrl: uploadedLogoUrl,
      },
    });

    await writeAuditLog({
      action: "CREATE_APP",
      entity: "App",
      entityId: created.id,
      actorId,
      actorEmail,
      meta: { after: created },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    if (uploadedLogoUrl) await deletePublicUploadByUrl(uploadedLogoUrl);

    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return jsonError(409, "Data duplikat (unique constraint).", { code: e.code, meta: e.meta });
    }
    return jsonError(500, "Gagal create app.", String(e));
  }
}

// ------------ PATCH (update via ?id=) ------------
export async function PATCH(req: NextRequest) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const actorId = guard.session.user?.id ?? null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  if (!id) return jsonError(400, "Missing query param: id");

  const before = await prisma.app.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await req.formData();

  const parsed = UpdateSchema.safeParse({
    name: form.get("name"),
    category: form.get("category"),
    url: form.get("url"),
    username: form.get("username"),
    password: form.get("password"),
    description: form.get("description"),
  });

  if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

  // optional file logo
  const nextLogo = form.get("logo");
  let newLogoUrl: string | undefined;

  if (nextLogo instanceof File && nextLogo.size > 0) {
    const uploaded = await savePublicUpload(nextLogo, "apps");
    newLogoUrl = uploaded.urlPath;
  }

  const data: any = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.category !== undefined) data.category = parsed.data.category;

  if (parsed.data.url !== undefined) data.url = normalizeUrl(parsed.data.url);

  // ✅ opsional
  if (parsed.data.username !== undefined) data.username = normalizeOptionalString(parsed.data.username);
  if (parsed.data.password !== undefined) data.password = normalizeOptionalString(parsed.data.password);

  if (parsed.data.description !== undefined) data.description = normalizeDescription(parsed.data.description);

  if (newLogoUrl) data.logoUrl = newLogoUrl;

  try {
    const updated = await prisma.app.update({ where: { id }, data });

    // kalau ganti logo, hapus logo lama
    if (newLogoUrl) await deletePublicUploadByUrl(before.logoUrl);

    await writeAuditLog({
      action: "UPDATE_APP",
      entity: "App",
      entityId: id,
      actorId,
      actorEmail,
      meta: { before, after: updated },
    });

    return NextResponse.json(updated);
  } catch (e) {
    if (newLogoUrl) await deletePublicUploadByUrl(newLogoUrl);

    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return jsonError(409, "Data duplikat (unique constraint).", { code: e.code, meta: e.meta });
      if (e.code === "P2025") return jsonError(404, "Record tidak ditemukan saat update.", { code: e.code });
    }
    return jsonError(500, "Gagal update app.", String(e));
  }
}

// ------------ DELETE (delete via ?id=) ------------
export async function DELETE(req: NextRequest) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const actorId = guard.session.user?.id ?? null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  if (!id) return jsonError(400, "Missing query param: id");

  const before = await prisma.app.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const usedCount = await prisma.request.count({ where: { appId: id } });
  if (usedCount > 0) {
    return jsonError(409, `App tidak bisa dihapus karena masih dipakai oleh ${usedCount} request.`, { usedCount });
  }

  try {
    await prisma.app.delete({ where: { id } });

    // hapus file logo kalau ada
    await deletePublicUploadByUrl(before.logoUrl);

    await writeAuditLog({
      action: "DELETE_APP",
      entity: "App",
      entityId: id,
      actorId,
      actorEmail,
      meta: { before },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return jsonError(409, "Tidak bisa delete karena masih ada relasi (FK constraint).", { code: e.code, meta: e.meta });
    }
    return jsonError(500, "Gagal delete app.", String(e));
  }
}
