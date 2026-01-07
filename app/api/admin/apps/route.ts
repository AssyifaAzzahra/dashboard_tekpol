// app/api/admin/apps/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";
import { writeAuditLog } from "@/lib/audit";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

const CreateSchema = z.object({
  name: z.string().min(1),
  category: z.enum(["HO", "REGIONAL"]),
  username: z.string().min(1),
  password: z.string().min(1),
  description: z.string().optional(),
  url: z.string().optional(),
});

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum(["HO", "REGIONAL"]).optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
});

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

function normalizeUrl(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v !== "string") return undefined;

  const t = v.trim();
  if (!t) return null;

  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;

  try {
    new URL(withProto);
    return withProto;
  } catch {
    return withProto;
  }
}

// ------------ GET (list) ------------
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const data = await prisma.app.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(data);
}

// ------------ POST (create) ------------
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const actorId = guard.session.user?.id ?? null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  const parsed = CreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

  try {
    const created = await prisma.app.create({
      data: {
        name: parsed.data.name,
        category: parsed.data.category,
        username: parsed.data.username,
        password: parsed.data.password,
        description: normalizeDescription(parsed.data.description),
        url: normalizeUrl(parsed.data.url),
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
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return jsonError(409, "Data duplikat (unique constraint).", { code: e.code, meta: e.meta });
    }
    return jsonError(500, "Gagal create app.", String(e));
  }
}

// ------------ PATCH (update via ?id=) ------------
export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const actorId = guard.session.user?.id ?? null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  if (!id) return jsonError(400, "Missing query param: id");

  const before = await prisma.app.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = UpdateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

  const data = {
    ...parsed.data,
    description: normalizeDescription(parsed.data.description),
    url: normalizeUrl(parsed.data.url),
  };

  try {
    const updated = await prisma.app.update({ where: { id }, data });

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
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return jsonError(409, "Data duplikat (unique constraint).", { code: e.code, meta: e.meta });
      if (e.code === "P2025") return jsonError(404, "Record tidak ditemukan saat update.", { code: e.code });
    }
    return jsonError(500, "Gagal update app.", String(e));
  }
}

// ------------ DELETE (delete via ?id=) ------------
export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin();
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
