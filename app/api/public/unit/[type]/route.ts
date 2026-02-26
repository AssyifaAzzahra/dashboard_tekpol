import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UnitType = "pks" | "ppis" | "ppkr";

function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

function normalizeType(raw: string | undefined | null): UnitType | null {
  const t = (raw ?? "").toLowerCase().trim();
  if (t === "pks" || t === "ppis" || t === "ppkr") return t;
  return null;
}

/**
 * GET /api/public/unit/:type
 * - /api/public/unit/pks
 * - /api/public/unit/ppis
 * - /api/public/unit/ppkr
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ type: string }> }) {
  const { type: rawType } = await ctx.params; // ✅ await params
  const type = normalizeType(rawType);
  if (!type) return jsonError(400, "Type tidak valid. Gunakan: pks | ppis | ppkr");

  const select = {
    id: true,
    name: true,
    slug: true,
    createdAt: true,
    updatedAt: true,
  } as const;

  const rows =
    type === "pks"
      ? await prisma.pks.findMany({ orderBy: { createdAt: "desc" }, select })
      : type === "ppis"
      ? await prisma.ppis.findMany({ orderBy: { createdAt: "desc" }, select })
      : await prisma.ppkr.findMany({ orderBy: { createdAt: "desc" }, select });

  return NextResponse.json(rows);
}