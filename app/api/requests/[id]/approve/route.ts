import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ Next.js 16
) {
  const { id } = await context.params; // ✅ WAJIB await

  if (!id) {
    return NextResponse.json(
      { error: "Request ID missing in URL" },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "KABAG") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { decision, note } = Body.parse(await request.json());

  const approval = await prisma.approval.findFirst({
    where: {
      requestId: id,
      role: "KABAG",
    },
  });

  if (!approval) {
    return NextResponse.json(
      { error: "Approval KABAG tidak ditemukan" },
      { status: 404 }
    );
  }

  await prisma.$transaction(async (tx) => {
    await tx.approval.update({
      where: { id: approval.id },
      data: {
        decision,
        note: note ?? null,
        decidedAt: new Date(),
        approverId: session.user.id,
      },
    });

    await tx.request.update({
      where: { id },
      data: {
        status: decision,
        rejectionNote: decision === "REJECTED" ? note ?? null : null,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
