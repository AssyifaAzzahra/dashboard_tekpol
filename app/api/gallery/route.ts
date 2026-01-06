import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await prisma.gallery.findMany({
    where: { isVisible: true },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(
    data.map((it) => ({
      id: it.id,
      title: it.title,
      caption: it.caption,
      image: it.imageUrl,
      category: (it.category && it.category.trim()) ? it.category.trim() : "Umum", // ✅ ini bedanya
      order: it.order,
      createdAt: it.createdAt,
    }))
  );
}
