import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

type Decision = "PENDING" | "APPROVED" | "REJECTED";

const Body = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // ✅ params sekarang Promise, jadi harus di-await
  const { id } = await context.params;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const approverId = session.user?.id;
  if (!approverId) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { decision, note } = Body.parse(await request.json());

  const requestData = await prisma.request.findUnique({
    where: { id },
    include: { approvals: true },
  });
  if (!requestData) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const approval = await prisma.approval.findFirst({
    where: { requestId: requestData.id, approverId },
  });
  if (!approval) {
    return NextResponse.json(
      { error: "Tidak berwenang approve request ini." },
      { status: 403 }
    );
  }

await prisma.$transaction(async (tx) => {
  await tx.approval.update({
    where: { id: approval.id },
    data: { decision, note, decidedAt: new Date() },
  });

    const approvals = await tx.approval.findMany({
      where: { requestId: requestData.id },
    });

    const anyRejected = approvals.some(
      (a: { decision: Decision }) => a.decision === "REJECTED"
    );
    if (anyRejected) {
      await tx.request.update({
        where: { id: requestData.id },
        data: { status: "REJECTED", rejectionNote: note || null },
      });
      return;
    }

    const allApproved = approvals.every(
      (a: { decision: Decision }) => a.decision === "APPROVED"
    );
    if (allApproved) {
      await tx.request.update({
        where: { id: requestData.id },
        data: { status: "APPROVED", rejectionNote: null },
      });
    } else {
      await tx.request.update({
        where: { id: requestData.id },
        data: { status: "PENDING" },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
