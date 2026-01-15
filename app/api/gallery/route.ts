import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ✅ Schema create gallery (fix: order bisa "", undefined -> jadi 0)
const CreateSchema = z.object({
  title: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  imageUrl: z.string().min(1, "imageUrl wajib"),
  category: z.string().optional().nullable(),
  order: z
    .coerce
    .number()
    .optional()
    .transform((v) => (Number.isFinite(v as number) ? (v as number) : 0)),
  isVisible: z.coerce.boolean().optional().default(true),
});

// =========================
// GET (public gallery)
// =========================
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
      category: it.category && it.category.trim() ? it.category.trim() : "Umum",
      order: it.order,
      createdAt: it.createdAt,
    }))
  );
}

// =========================
// POST (admin create gallery)
// =========================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "ZodError",
          message: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const created = await prisma.gallery.create({
      data: {
        title: parsed.data.title?.trim() || null,
        caption: parsed.data.caption?.trim() || null,
        imageUrl: parsed.data.imageUrl,
        category: parsed.data.category?.trim() || null,
        order: parsed.data.order ?? 0, // ✅ aman
        isVisible: parsed.data.isVisible ?? true,
      },
    });

    return NextResponse.json({ ok: true, data: created });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Internal Server Error", message: "Gagal membuat galeri.", extra: String(e?.message || e) },
      { status: 500 }
    );
  }
}
