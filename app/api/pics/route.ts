import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pics = await prisma.user.findMany({
    where: { role: "KARYAWAN", isPic: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });
  return NextResponse.json(pics);
}
