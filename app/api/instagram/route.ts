import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NewsSource } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const take = Math.min(Math.max(Number(searchParams.get("take") ?? "6"), 1), 12);

  const data = await prisma.news.findMany({
    where: {
      isPublished: true,
      sourceType: NewsSource.INSTAGRAM,
      instagramUrl: { not: null },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take,
    select: {
      id: true,
      title: true,
      instagramUrl: true,
      coverImageUrl: true, // optional thumbnail (kalau admin upload cover)
      createdAt: true,
    },
  });

  return NextResponse.json(
    data
      .filter((x) => !!x.instagramUrl)
      .map((x) => ({
        id: x.id,
        title: x.title,
        instagramUrl: x.instagramUrl!,
        coverImageUrl: x.coverImageUrl,
        createdAt: x.createdAt.toISOString(),
      }))
  );
}
