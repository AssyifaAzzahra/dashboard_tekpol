// app/api/pks-deck/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pksId = searchParams.get("pksId");

  if (!pksId) return NextResponse.json({ error: "pksId is required" }, { status: 400 });

  const deck = await prisma.pksProfileDeck.findUnique({ where: { pksId } });

  return NextResponse.json(
    deck
      ? {
          pksId: deck.pksId,
          fileUrl: deck.fileUrl,
          fileName: deck.fileName,
          fileType: (deck as any).fileType ?? null,
          coverUrl: (deck as any).coverUrl ?? null,
          updatedAt: deck.updatedAt,
        }
      : null
  );
}
