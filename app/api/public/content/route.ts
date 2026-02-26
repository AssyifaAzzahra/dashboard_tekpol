// app/api/public/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TEKPOL_CONTENT_MAP } from "@/lib/constants/tekpol-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

/**
 * GET /api/public/content?key=...
 * - DB first
 * - fallback constants
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = String(searchParams.get("key") || "").trim();
  if (!key) return bad("key is required");

  const row = await prisma.contentSection.findUnique({ where: { key } });
  if (row) return NextResponse.json({ from: "db", ...row });

  const fallback = TEKPOL_CONTENT_MAP[key];
  if (!fallback) return bad("Unknown key", 404);

  return NextResponse.json({ from: "fallback", key, title: fallback.title, content: fallback });
}