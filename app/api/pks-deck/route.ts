import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/pks-deck?pksId=... -> detail deck utk 1 PKS */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pksId = String(searchParams.get("pksId") || "").trim();
  if (!pksId) return NextResponse.json({ error: "pksId is required" }, { status: 400 });

  const row = await prisma.pksProfileDeck.findUnique({ where: { pksId } });

  // kalau belum ada deck, return null biar UI bisa tampil "Belum ada profil"
  return NextResponse.json(row ?? null);
}