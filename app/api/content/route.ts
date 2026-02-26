import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContentBucketSchema } from "@/lib/validators/content";
import { CONTENT_MAP } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = (searchParams.get("path") || "").trim();

  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  // 1) coba ambil dari DB
  const db = await prisma.contentSection.findUnique({
    where: { key: path },
  });

  if (db) {
    const parsed = ContentBucketSchema.safeParse(db.content);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid content format in DB", detail: parsed.error },
        { status: 500 }
      );
    }
    return NextResponse.json(parsed.data);
  }

  // 2) fallback ke constants lama
  const fallback = (CONTENT_MAP as any)[path];
  if (fallback) return NextResponse.json(fallback);

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
