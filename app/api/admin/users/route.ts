// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/lib/admin";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { writeAuditLog } from "@/lib/audit";
import type { Prisma, Role } from "@prisma/client";

const RoleEnum = z.enum(["SUPERADMIN", "ADMIN", "PKWT", "KARYAWAN", "KASUBAG", "KABAG", "GUEST"]);

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: RoleEnum,
  isPic: z.boolean().optional(),
});

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: RoleEnum.optional(),
  isPic: z.boolean().optional(),
  resetPassword: z.string().min(6).optional(),
});

function jsonError(status: number, message: string, extra?: unknown) {
  return NextResponse.json(
    { error: status >= 500 ? "Internal Server Error" : "Bad Request", message, extra },
    { status }
  );
}

type PrismaLikeError = {
  code?: string;
  meta?: unknown;
  message?: string;
};

function asPrismaLikeError(e: unknown): PrismaLikeError {
  if (typeof e === "object" && e !== null) {
    const obj = e as Record<string, unknown>;
    return {
      code: typeof obj.code === "string" ? obj.code : undefined,
      meta: obj.meta,
      message: typeof obj.message === "string" ? obj.message : undefined,
    };
  }
  return {};
}

function errorToString(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

// ------------ GET (list) ------------
export async function GET() {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, isPic: true, createdAt: true },
  });

  return NextResponse.json(users);
}

// ------------ POST (create) ------------
export async function POST(req: NextRequest) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const actorId = guard.session.user?.id ?? null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  const parsed = CreateUserSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    const created = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        isPic: parsed.data.isPic ?? false,
        passwordHash,
      },
      select: { id: true, name: true, email: true, role: true, isPic: true, createdAt: true },
    });

    await writeAuditLog({
      action: "CREATE_USER",
      entity: "User",
      entityId: created.id,
      actorId,
      actorEmail,
      meta: { after: created },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    const pe = asPrismaLikeError(e);

    // Unique constraint (biasanya email unique)
    if (pe.code === "P2002") {
      return jsonError(409, "Email sudah digunakan (duplicate).", { code: pe.code, meta: pe.meta });
    }

    return jsonError(500, "Gagal create user.", errorToString(e));
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

  const before = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, isPic: true, createdAt: true },
  });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const parsed = UpdateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

  const data: Prisma.UserUpdateInput = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.email !== undefined) data.email = parsed.data.email;
  if (parsed.data.role !== undefined) data.role = parsed.data.role as Role;
  if (parsed.data.isPic !== undefined) data.isPic = parsed.data.isPic;

  const doReset = Boolean(parsed.data.resetPassword?.trim());
  if (doReset) {
    data.passwordHash = await bcrypt.hash(parsed.data.resetPassword!.trim(), 10);
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, isPic: true, createdAt: true },
    });

    await writeAuditLog({
      action: doReset ? "UPDATE_USER_AND_RESET_PASSWORD" : "UPDATE_USER",
      entity: "User",
      entityId: id,
      actorId,
      actorEmail,
      meta: { before, after: updated, resetPassword: doReset },
    });

    return NextResponse.json(updated);
  } catch (e: unknown) {
    const pe = asPrismaLikeError(e);

    if (pe.code === "P2002") {
      return jsonError(409, "Email sudah digunakan (duplicate).", { code: pe.code, meta: pe.meta });
    }

    return jsonError(500, "Gagal update user.", errorToString(e));
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

  const before = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, isPic: true, createdAt: true },
  });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const meId = guard.session.user?.id ?? null;
  if (meId && meId === id) {
    return jsonError(409, "Tidak bisa menghapus akun yang sedang login.");
  }

  try {
    await prisma.user.delete({ where: { id } });

    await writeAuditLog({
      action: "DELETE_USER",
      entity: "User",
      entityId: id,
      actorId,
      actorEmail,
      meta: { before },
    });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const pe = asPrismaLikeError(e);

    // FK constraint
    if (pe.code === "P2003") {
      return jsonError(409, "Tidak bisa delete user karena masih ada relasi (FK constraint).", {
        code: pe.code,
        meta: pe.meta,
      });
    }

    return jsonError(500, "Gagal delete user.", errorToString(e));
  }
}
