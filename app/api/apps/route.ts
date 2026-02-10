// app/api/apps/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // sesuaikan path authOptions kamu

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Role = "SUPERADMIN" | "ADMIN" | "PKWT" | "KARYAWAN" | "KASUBAG" | "KABAG" | "GUEST";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role as Role | undefined;

  const canSeeCreds = role === "KARYAWAN" || role === "SUPERADMIN";

  const apps = await prisma.app.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: canSeeCreds
      ? {
          id: true,
          name: true,
          category: true,
          url: true,
          description: true,
          logoUrl: true,
          username: true, // ✅
          password: true, // ✅
        }
      : {
          id: true,
          name: true,
          category: true,
          url: true,
          description: true,
          logoUrl: true,
        },
  });

  return NextResponse.json(apps);
}
