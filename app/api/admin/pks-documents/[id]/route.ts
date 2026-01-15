import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/lib/admin"; // sesuaikan
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PatchSchema = z.object({
  status: z.enum(["PENDING", "ACCEPTED", "REJECTED"]),
  adminNote: z.string().optional().nullable(),
});

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> | { id: string } }) {
  await requireSuperadmin();

  // ✅ FIX kompatibel Next 15/16: params kadang Promise
  const params = await Promise.resolve(ctx.params as any);
  const id = params?.id;

  if (!id) {
    return NextResponse.json(
      { error: "Bad Request", message: "Missing route param: id" },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Bad Request", message: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await prisma.pksDocumentSubmission.update({
    where: { id },
    data: {
      status: parsed.data.status,
      adminNote: parsed.data.adminNote ?? null,
    },
  });

  return NextResponse.json({ ok: true, data: updated });
}
