import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 20,
  });

  return NextResponse.json(
    data.map((n) => ({
      id: n.id,
      title: n.title,
      slug: n.slug,
      excerpt: n.excerpt,
      image: n.coverImageUrl,
      date: (n.publishedAt ?? n.createdAt).toISOString(),
      tag: "Berita",
    }))
  );
}
