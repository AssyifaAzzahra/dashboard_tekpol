import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

/**
 * GET /api/public/pks-deck/:key
 * key bisa:
 * - deck.pksId (string dari admin, sering "pks-xxx")
 * - slug PKS
 * - id PKS (cuid)
 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ pksId: string }> }) {
  const { pksId: rawKey } = await ctx.params; // ✅ await params
  const key = String(rawKey ?? "").trim();
  if (!key) return jsonError(400, "pksId wajib diisi");

  // 1) Coba langsung: deck.pksId == key
  let deck = await prisma.pksProfileDeck.findFirst({
    where: { pksId: key },
  });

  // 2) Kalau key itu ID PKS (cuid) => ambil slug lalu coba beberapa kandidat
  if (!deck) {
    const pksById = await prisma.pks.findUnique({
      where: { id: key },
      select: { slug: true },
    });

    if (pksById?.slug) {
      const candidates = [
        pksById.slug,          // "tanah-putih"
        `pks-${pksById.slug}`, // "pks-tanah-putih" (format PKS_LIST sering begini)
        key,
      ];

      deck = await prisma.pksProfileDeck.findFirst({
        where: { pksId: { in: candidates } },
      });
    }
  }

  // 3) Kalau key itu slug => coba juga pks-{slug}
  if (!deck) {
    const candidates = [key, `pks-${key}`];
    deck = await prisma.pksProfileDeck.findFirst({
      where: { pksId: { in: candidates } },
    });
  }

  if (!deck) {
    return NextResponse.json({ data: null });
  }

  return NextResponse.json({
    data: {
      id: deck.id,
      pksId: deck.pksId,
      fileUrl: deck.fileUrl,
      fileName: deck.fileName,
      fileType: deck.fileType,
      coverUrl: deck.coverUrl,
      createdAt: deck.createdAt,
      updatedAt: deck.updatedAt,
    },
  });
}