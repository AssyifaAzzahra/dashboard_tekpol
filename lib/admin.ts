// lib/admin.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export type Role =
  | "SUPERADMIN"
  | "ADMIN"
  | "PKWT"
  | "KARYAWAN"
  | "KASUBAG"
  | "KABAG"
  | "GUEST";

function forbidden(extra?: unknown) {
  return NextResponse.json({ error: "Forbidden", ...((extra as any) ?? {}) }, { status: 403 });
}

export async function requireSuperadmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user?.role ?? "GUEST") as Role;

  if (!session?.user?.id || role !== "SUPERADMIN") {
    return { ok: false as const, session: null, res: forbidden() };
  }
  return { ok: true as const, session, res: null };
}

/** ✅ NEW: boleh SUPERADMIN atau ADMIN */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user?.role ?? "GUEST") as Role;

  if (!session?.user?.id || (role !== "SUPERADMIN" && role !== "ADMIN")) {
    return {
      ok: false as const,
      session: null,
      res: forbidden({
        reason: "NOT_ADMIN",
        role,
        email: session?.user?.email ?? null,
      }),
    };
  }

  return { ok: true as const, session, res: null };
}
