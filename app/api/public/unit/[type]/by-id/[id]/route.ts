import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UnitType = "pks" | "ppis" | "ppkr";

function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

function normalizeType(type?: string): UnitType | null {
  const t = (type ?? "").toLowerCase().trim();
  if (t === "pks" || t === "ppis" || t === "ppkr") return t;
  return null;
}

/**
 * GET
 * /api/public/unit/pks/by-id/:id
 * /api/public/unit/ppis/by-id/:id
 * /api/public/unit/ppkr/by-id/:id
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ type: string; id: string }> }) {
  const { type: rawType, id: rawId } = await ctx.params; // ✅ await params
  const type = normalizeType(rawType);
  if (!type) return jsonError(400, "Type tidak valid. Gunakan: pks | ppis | ppkr");

  const id = String(rawId ?? "").trim();
  if (!id) return jsonError(400, "id wajib diisi");

  const select = {
    id: true,
    name: true,
    slug: true,
    shortProfile: true,
    address: true,
    capacity: true,
    yearOperation: true,
    lineCount: true,
    operationalNotes: true,
    photoUrl: true,
    structureUrl: true,
    certificateUrl: true,
    createdAt: true,
    updatedAt: true,
  };

  const row =
    type === "pks"
      ? await prisma.pks.findUnique({ where: { id }, select })
      : type === "ppis"
      ? await prisma.ppis.findUnique({ where: { id }, select })
      : await prisma.ppkr.findUnique({ where: { id }, select });

  if (!row) return jsonError(404, "Not found");
  return NextResponse.json(row);
}