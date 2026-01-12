import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await prisma.news.findMany({
    where: {
      isPublished: true,
      sourceType: "INSTAGRAM",
      instagramUrl: { not: null },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 9,
    select: {
      id: true,
      title: true,
      instagramUrl: true,
    },
  });

  return NextResponse.json(data);
}
