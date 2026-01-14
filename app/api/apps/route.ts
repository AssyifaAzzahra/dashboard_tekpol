// app/api/apps/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const apps = await prisma.app.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
      url: true,
      description: true,
      logoUrl: true, // ✅ PENTING
    },
  });

  return NextResponse.json(apps);
}
