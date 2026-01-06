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

export async function requireSuperadmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user?.role ?? "GUEST") as Role;

  if (!session?.user?.id || role !== "SUPERADMIN") {
    return { ok: false as const, session: null, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { ok: true as const, session, res: null };
}