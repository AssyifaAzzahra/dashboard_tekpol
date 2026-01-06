import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ✅ Next.js 16: params harus Promise
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const safeSlug = (slug ?? "").trim();

  if (!safeSlug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const post = await prisma.news.findFirst({
    where: { slug: safeSlug, isPublished: true },
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    image: post.coverImageUrl,
    date: (post.publishedAt ?? post.createdAt).toISOString(),
  });
}
