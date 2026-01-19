// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/lib/admin";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { writeAuditLog } from "@/lib/audit";
import type { Prisma, Role } from "@prisma/client";

const RoleEnum = z.enum([
  "SUPERADMIN",
  "ADMIN",
  "PKWT",
  "KARYAWAN",
  "KASUBAG",
  "KABAG",
  "GUEST",
]);

function jsonError(status: number, message: string, extra?: unknown) {
  return NextResponse.json(
    { error: status >= 500 ? "Internal Server Error" : "Bad Request", message, extra },
    { status }
  );
}

type PrismaLikeError = { code?: string; meta?: unknown; message?: string };

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

// ---------- helpers ----------
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isDigits = (s: string) => /^\d+$/.test(s);

function normalizeString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
}

function normalizeEmail(v: unknown): string | undefined {
  const t = normalizeString(v);
  if (!t) return undefined;
  return t.toLowerCase();
}

// ✅ auto-fix: kalau email ternyata angka, pindahkan ke sapNo
function coerceEmailSap(input: { email?: unknown; sapNo?: unknown }) {
  const emailRaw = normalizeEmail(input.email);
  const sapRaw = normalizeString(input.sapNo);

  // kalau email terisi tapi bukan email valid
  if (emailRaw && !isEmail(emailRaw)) {
    // kalau bentuknya angka dan sapNo masih kosong -> treat sebagai sapNo
    if (isDigits(emailRaw) && !sapRaw) {
      return { email: undefined, sapNo: emailRaw };
    }
    // email tidak valid dan bukan angka -> tetap invalid
    return { email: emailRaw, sapNo: sapRaw };
  }

  return { email: emailRaw, sapNo: sapRaw };
}

// ---------- Zod preprocess (hindari "val merah") ----------
const emptyToUndefined = (v: unknown) => {
  const t = normalizeString(v);
  return t === undefined ? undefined : t;
};

const EmailField = z.preprocess(emptyToUndefined, z.string().email("Invalid email address").optional());
const SapNoField = z.preprocess(
  emptyToUndefined,
  z.string().regex(/^\d+$/, "No. SAP harus angka").optional()
);

// ✅ CREATE schema (tapi akan kita coerce dulu sebelum parse)
const CreateUserSchema = z
  .object({
    name: z.string().min(1),
    email: EmailField,
    sapNo: SapNoField,
    password: z.string().min(6),
    role: RoleEnum,
    isPic: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const emailOk = typeof data.email === "string" && data.email.trim() !== "";
    const sapOk = typeof data.sapNo === "string" && data.sapNo.trim() !== "";
    if (!emailOk && !sapOk) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Isi minimal Email atau No. SAP",
        path: ["email"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Isi minimal Email atau No. SAP",
        path: ["sapNo"],
      });
    }
  });

// ✅ UPDATE schema (kita coerce juga sebelum parse)
const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: EmailField,
  sapNo: SapNoField,
  role: RoleEnum.optional(),
  isPic: z.boolean().optional(),
  resetPassword: z.string().min(6).optional(),
});

function undefToNull(v: string | undefined): string | null {
  return v === undefined ? null : v;
}

// ------------ GET (list) ------------
export async function GET() {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        sapNo: true,
        role: true,
        isPic: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (e) {
    return jsonError(500, "Gagal load users.", { detail: errorToString(e) });
  }
}

// ------------ POST (create) ------------
export async function POST(req: NextRequest) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const actorId = guard.session.user?.id ?? null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return jsonError(400, "Body JSON tidak valid.", { detail: errorToString(e) });
  }

  // ✅ Auto-fix: kalau SAP masuk ke email, pindahkan ke sapNo
  const coerced = coerceEmailSap({ email: body?.email, sapNo: body?.sapNo });

  // gunakan body asli tapi override email/sapNo yang sudah dicoerce
  const parsed = CreateUserSchema.safeParse({
    ...body,
    email: coerced.email,
    sapNo: coerced.sapNo,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { name: "ZodError", message: parsed.error.message, issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    const created = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: undefToNull(parsed.data.email),
        sapNo: undefToNull(parsed.data.sapNo),
        role: parsed.data.role as Role,
        isPic: parsed.data.isPic ?? false,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        sapNo: true,
        role: true,
        isPic: true,
        createdAt: true,
      },
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
    if (pe.code === "P2002") {
      return jsonError(409, "Email atau No. SAP sudah digunakan (duplicate).", {
        code: pe.code,
        meta: pe.meta,
      });
    }
    return jsonError(500, "Gagal create user.", { detail: errorToString(e) });
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
    select: {
      id: true,
      name: true,
      email: true,
      sapNo: true,
      role: true,
      isPic: true,
      createdAt: true,
    },
  });
  if (!before) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return jsonError(400, "Body JSON tidak valid.", { detail: errorToString(e) });
  }

  // ✅ Auto-fix juga di update kalau UI masih salah kirim
  const coerced = coerceEmailSap({ email: body?.email, sapNo: body?.sapNo });

  const parsed = UpdateSchema.safeParse({
    ...body,
    email: coerced.email,
    sapNo: coerced.sapNo,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { name: "ZodError", message: parsed.error.message, issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data: Prisma.UserUpdateInput = {};
  if (parsed.data.name !== undefined) data.name = parsed.data.name;

  // hanya update kalau field ada di body (agar tidak men-null-kan tanpa sengaja)
  if ("email" in body) data.email = undefToNull(parsed.data.email);
  if ("sapNo" in body) data.sapNo = undefToNull(parsed.data.sapNo);

  if (parsed.data.role !== undefined) data.role = parsed.data.role as Role;
  if (parsed.data.isPic !== undefined) data.isPic = parsed.data.isPic;

  const doReset = Boolean(parsed.data.resetPassword?.trim());
  if (doReset) {
    data.passwordHash = await bcrypt.hash(parsed.data.resetPassword!.trim(), 10);
  }

  // ✅ Guard: jangan sampai hasil akhir email & sapNo sama-sama null
  const emailNext =
    "email" in body ? (data.email as string | null) : before.email;
  const sapNext =
    "sapNo" in body ? (data.sapNo as string | null) : before.sapNo;

  if (!emailNext && !sapNext) {
    return jsonError(400, "Minimal salah satu: Email atau No. SAP harus terisi.");
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        sapNo: true,
        role: true,
        isPic: true,
        createdAt: true,
      },
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
      return jsonError(409, "Email atau No. SAP sudah digunakan (duplicate).", {
        code: pe.code,
        meta: pe.meta,
      });
    }
    return jsonError(500, "Gagal update user.", { detail: errorToString(e) });
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
    select: {
      id: true,
      name: true,
      email: true,
      sapNo: true,
      role: true,
      isPic: true,
      createdAt: true,
    },
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

    if (pe.code === "P2003") {
      return jsonError(409, "Tidak bisa delete user karena masih ada relasi (FK constraint).", {
        code: pe.code,
        meta: pe.meta,
      });
    }

    return jsonError(500, "Gagal delete user.", { detail: errorToString(e) });
  }
}
