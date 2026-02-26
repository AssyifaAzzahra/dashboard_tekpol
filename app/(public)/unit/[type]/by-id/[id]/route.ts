import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UnitType = "pks" | "ppis" | "ppkr";

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

function getType(params: { type?: string }): UnitType | null {
  const t = (params.type ?? "").toLowerCase();
  if (t === "pks" || t === "ppis" || t === "ppkr") return t;
  return null;
}

/**
 * GET
 * /api/public/unit/pks/by-id/:id
 * /api/public/unit/ppis/by-id/:id
 * /api/public/unit/ppkr/by-id/:id
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ type: string; id: string }> } // ✅ FIX: params is Promise
) {
  const params = await ctx.params; // ✅ FIX: await params

  const type = getType(params);
  if (!type) return bad("Invalid type. Use: pks | ppis | ppkr");

  const id = String(params.id || "").trim();
  if (!id) return bad("id is required");

  if (type === "pks") {
    const row = await prisma.pks.findUnique({
      where: { id },
      select: {
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
      },
    });

    if (!row) return bad("Not found", 404);
    return NextResponse.json(row);
  }

  if (type === "ppis") {
    const row = await prisma.ppis.findUnique({
      where: { id },
      select: {
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
      },
    });

    if (!row) return bad("Not found", 404);
    return NextResponse.json(row);
  }

  // ppkr
  const row = await prisma.ppkr.findUnique({
    where: { id },
    select: {
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
    },
  });

  if (!row) return bad("Not found", 404);
  return NextResponse.json(row);
}