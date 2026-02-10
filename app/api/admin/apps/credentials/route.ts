import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Role =
  | "PKWT"
  | "KARYAWAN"
  | "KASUBAG"
  | "KABAG"
  | "GUEST"
  | "SUPERADMIN"
  | "ADMIN";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user?.role ?? "GUEST") as Role;

  // ✅ hanya karyawan tekpol + superadmin
  const allowed = role === "KARYAWAN" || role === "SUPERADMIN";
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const apps = await prisma.app.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
      url: true,
      description: true,
      logoUrl: true,
      username: true,
      password: true,
    },
  });

  return NextResponse.json(apps);
}
