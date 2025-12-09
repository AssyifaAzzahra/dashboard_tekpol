// app/api/approval/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type Decision = "PENDING" | "APPROVED" | "REJECTED";

const BodySchema = z.object({
  id: z.string(), // requestId
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().optional(),
});

/**
 * GET /api/approval
 * Dipakai halaman Approval (Kabag/Kasubag) untuk ambil list request.
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Kalau belum login, kirim array kosong supaya front-end tidak error
    if (!session || !session.user?.id) {
      return NextResponse.json([], { status: 200 });
    }

    const approverId = session.user.id;

    const requests = await prisma.request.findMany({
      where: {
        approvals: {
          some: { approverId },
        },
      },
      include: {
        app: true,
        requester: true,
        pic: true,
        approvals: {
          include: {
            approver: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(requests, { status: 200 });
  } catch (err) {
    console.error("Error in GET /api/approval:", err);
    return NextResponse.json([], { status: 500 });
  }
}

/**
 * PATCH /api/approval
 * Dipanggil ketika Kabag/Kasubag klik Approve / Reject.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Data tidak valid" },
        { status: 400 },
      );
    }

    const { id: requestId, decision, note } = parsed.data;

    // Pastikan request ada
    const requestData = await prisma.request.findUnique({
      where: { id: requestId },
      include: { approvals: true },
    });

    if (!requestData) {
      return NextResponse.json(
        { error: "Request tidak ditemukan" },
        { status: 404 },
      );
    }

    // Ambil satu approval saja untuk request ini
    const approval = await prisma.approval.findFirst({
      where: { requestId },
    });

    if (!approval) {
      return NextResponse.json(
        { error: "Approval untuk request ini tidak ditemukan" },
        { status: 404 },
      );
    }

    // Transaction: update approval + status request
    await prisma.$transaction(async (tx) => {
      // 1. update approval ini
      await tx.approval.update({
        where: { id: approval.id },
        data: {
          decision,
          note,
          decidedAt: new Date(),
        },
      });

      // 2. ambil semua approval lagi
      const approvals = await tx.approval.findMany({
        where: { requestId },
      });

      const anyRejected = approvals.some(
        (a: { decision: Decision }) => a.decision === "REJECTED",
      );

      if (anyRejected) {
        await tx.request.update({
          where: { id: requestId },
          data: {
            status: "REJECTED",
            rejectionNote: note || null,
          },
        });
        return;
      }

      const allApproved = approvals.every(
        (a: { decision: Decision }) => a.decision === "APPROVED",
      );

      if (allApproved) {
        await tx.request.update({
          where: { id: requestId },
          data: {
            status: "APPROVED",
            rejectionNote: null,
          },
        });
      } else {
        await tx.request.update({
          where: { id: requestId },
          data: {
            status: "PENDING",
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error in PATCH /api/approval:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 },
    );
  }
}
