// app/api/admin/apps/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";
import { writeAuditLog } from "@/lib/audit";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ================== ZOD SCHEMA ==================
const CreateSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  category: z.enum(["HO", "REGIONAL"]).optional().default("HO"),
  url: z.string().min(1, "URL wajib diisi"),
  username: z.string().optional(), // opsional
  password: z.string().optional(), // opsional
  description: z.string().optional(),
});

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum(["HO", "REGIONAL"]).optional(),
  url: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  description: z.string().optional(),
});

// ================== HELPERS ==================
function jsonError(status: number, message: string, extra?: unknown) {
  return NextResponse.json(
    { error: status >= 500 ? "Internal Server Error" : "Bad Request", message, extra },
    { status }
  );
}

function normalizeTextToUndefined(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t ? t : undefined;
}

function normalizeUrlRequired(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;

  // auto tambah https:// kalau user input "example.com"
  const withProto = /^https?:\/\//i.test(t) ? t : `https://${t}`;

  try {
    // validasi URL, kalau gagal pun kita tetap simpan string-nya
    // eslint-disable-next-line no-new
    new URL(withProto);
    return withProto;
  } catch {
    return withProto;
  }
}

// ================== GET ==================
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  try {
    const data = await prisma.app.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(data);
  } catch (e: any) {
    console.error("GET /api/admin/apps ERROR:", e);
    return NextResponse.json(
      { message: e?.message ?? "Internal Server Error", detail: String(e) },
      { status: 500 }
    );
  }
}

// ================== POST ==================
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.res;

  const actorId = guard.session.user?.id ?? null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  const parsed = CreateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

  const url = normalizeUrlRequired(parsed.data.url);
  if (!url) return jsonError(400, "URL wajib diisi.");

  // schema kamu: username/password String? (nullable), tapi aman juga kalau DB lama masih NOT NULL
  // -> kalau kosong, set "" (tidak null) supaya insert tidak gagal
  const username = normalizeTextToUndefined(parsed.data.username) ?? "";
  const password = normalizeTextToUndefined(parsed.data.password) ?? "";

  try {
    const created = await prisma.app.create({
      data: {
        name: parsed.data.name.trim(),
        category: parsed.data.category,
        url,
        username,
        password,
        description: normalizeTextToUndefined(parsed.data.description) ?? null,
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
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return jsonError(409, "Data duplikat (unique constraint).", { code: e.code, meta: e.meta });
    }
    console.error("POST /api/admin/apps ERROR:", e);
    return jsonError(500, "Gagal create app.", String(e));
  }
}

// ================== PATCH ==================
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

  const data: Prisma.AppUpdateInput = {};

  if (parsed.data.name !== undefined) data.name = parsed.data.name.trim();
  if (parsed.data.category !== undefined) data.category = parsed.data.category;

  if (parsed.data.url !== undefined) {
    const url = normalizeUrlRequired(parsed.data.url);
    if (!url) return jsonError(400, "URL wajib diisi.");
    data.url = url;
  }

  // kalau user kosongkan -> set "" biar kompatibel dengan DB yang masih NOT NULL
  if (parsed.data.username !== undefined) data.username = normalizeTextToUndefined(parsed.data.username) ?? "";
  if (parsed.data.password !== undefined) data.password = normalizeTextToUndefined(parsed.data.password) ?? "";

  if (parsed.data.description !== undefined) {
    const d = normalizeTextToUndefined(parsed.data.description);
    (data as any).description = d ?? null;
  }

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
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002")
        return jsonError(409, "Data duplikat (unique constraint).", { code: e.code, meta: e.meta });
      if (e.code === "P2025")
        return jsonError(404, "Record tidak ditemukan saat update.", { code: e.code });
    }
    console.error("PATCH /api/admin/apps ERROR:", e);
    return jsonError(500, "Gagal update app.", String(e));
  }
}

// ================== DELETE ==================
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
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return jsonError(409, "Tidak bisa delete karena masih ada relasi (FK constraint).", {
        code: e.code,
        meta: e.meta,
      });
    }
    console.error("DELETE /api/admin/apps ERROR:", e);
    return jsonError(500, "Gagal delete app.", String(e));
  }
}
