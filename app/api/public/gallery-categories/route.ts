import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const cats = await prisma.galleryCategory.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    select: { name: true, order: true },
  });

  const photos = await prisma.gallery.findMany({
    where: { isVisible: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      caption: true,
      imageUrl: true,
      category: true,
      order: true,
      createdAt: true,
    },
  });

  const map = new Map<string, any[]>();
  for (const p of photos) {
    const key = p.category?.trim() || "Umum";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push({
      id: p.id,
      title: p.title,
      caption: p.caption,
      image: p.imageUrl,
      category: key,
      order: p.order,
      createdAt: p.createdAt,
    });
  }

  const result = cats.map((c) => ({
    name: c.name,
    items: map.get(c.name) ?? [],
  }));

  if (!cats.some((c) => c.name === "Umum") && map.has("Umum")) {
    result.unshift({ name: "Umum", items: map.get("Umum") ?? [] });
  }

  return NextResponse.json(result);
}
