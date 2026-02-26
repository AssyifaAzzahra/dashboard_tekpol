import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

function clean(v: unknown) {
  return String(v ?? "").trim();
}

function uniq(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

/**
 * GET /api/public/pks-deck/:key
 * key bisa:
 * - deck.pksId (mis: "pks-terantam")
 * - slug PKS (mis: "tanah-putih")
 * - "pks-" + slug (mis: "pks-tanah-putih")
 * - id PKS (cuid) (mis: "cmm0wpl9w....") -> akan dicari slug-nya
 */
export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ pksId: string }> }
) {
  // 1) ambil key dari params
  let key = "";
  try {
    const p = await ctx.params;
    key = clean(p?.pksId);
  } catch {
    key = "";
  }

  // 2) fallback: ambil dari pathname kalau params kosong
  if (!key) {
    try {
      const pathname = new URL(req.url).pathname; // /api/public/pks-deck/<key>
      const parts = pathname.split("/").filter(Boolean);
      key = clean(parts[parts.length - 1]);
    } catch {
      key = "";
    }
  }

  if (!key) return jsonError(400, "pksId wajib diisi");

  // kandidat awal (langsung)
  let candidates = uniq([
    key, // pks-terantam / tanah-putih / cmm0...
    key.startsWith("pks-") ? key.slice(4) : "", // kalau key pks-xxx, coba xxx
    key.startsWith("pks-") ? "" : `pks-${key}`, // kalau key xxx, coba pks-xxx
  ]);

  // Kalau key adalah id PKS, cari slug-nya lalu tambahkan kandidat
  const pksById = await prisma.pks.findUnique({
    where: { id: key },
    select: { slug: true },
  });

  if (pksById?.slug) {
    candidates = uniq([
      ...candidates,
      pksById.slug, // tanah-putih
      `pks-${pksById.slug}`, // pks-tanah-putih
    ]);
  }

  // Cari deck dengan salah satu kandidat
  const deck = await prisma.pksProfileDeck.findFirst({
    where: { pksId: { in: candidates } },
    orderBy: { updatedAt: "desc" },
  });

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