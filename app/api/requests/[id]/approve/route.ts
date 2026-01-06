// app/api/approval/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";

type Decision = "PENDING" | "APPROVED" | "REJECTED";
type Role = "PKWT" | "KARYAWAN" | "KASUBAG" | "KABAG" | "GUEST";

const BodySchema = z.object({
  id: z.string().min(1), // requestId
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().optional(),
});

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * GET /api/approval
 * Mengambil request yang relevan untuk user login (berdasarkan approvals.approverId)
 */
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json([], { status: 200 });

    const approverId = session.user.id;

    const requests = await prisma.request.findMany({
      where: {
        approvals: { some: { approverId } },
      },
      include: {
        app: true,
        requester: true,
        pic: true,
        approvals: { include: { approver: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests, { status: 200 });
  } catch (err) {
    console.error("GET /api/approval error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

/**
 * PATCH /api/approval
 * ✅ KASUBAG = approver utama (final)
 * ✅ KABAG = backup (hanya jika approval KASUBAG masih PENDING)
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return jsonError("Unauthorized", 401);

    const userId = session.user.id;
    const role = (session.user.role ?? "GUEST") as Role;

    // hanya KASUBAG / KABAG yang boleh approve
    if (role !== "KASUBAG" && role !== "KABAG") {
      return jsonError("Role tidak diizinkan untuk approval", 403);
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return jsonError("Data tidak valid", 400);

    const { id: requestId, decision, note } = parsed.data;

    const requestData = await prisma.request.findUnique({
      where: { id: requestId },
      include: { approvals: true },
    });

    if (!requestData) return jsonError("Request tidak ditemukan", 404);

    const kasubagApproval = requestData.approvals.find(
      (a) => a.role === "KASUBAG",
    );

    if (!kasubagApproval) {
      return jsonError("Approval KASUBAG tidak ditemukan pada request ini", 404);
    }

    // ✅ jika KASUBAG sudah memutuskan, maka final (KABAG tidak bisa override)
    if (kasubagApproval.decision !== "PENDING") {
      return jsonError("Permohonan sudah diputuskan oleh KASUBAG", 409);
    }

    // ✅ jika yang memutuskan adalah KABAG, pastikan record approval KABAG ada
    let approvalToUpdateId: string | null = null;

    if (role === "KASUBAG") {
      approvalToUpdateId = kasubagApproval.id;
    } else {
      const kabagApproval = requestData.approvals.find((a) => a.role === "KABAG");
      if (!kabagApproval) {
        return jsonError("Approval KABAG tidak ditemukan pada request ini", 404);
      }
      approvalToUpdateId = kabagApproval.id;
    }

    await prisma.$transaction(async (tx) => {
      // update approval sesuai role pelaku
      await tx.approval.update({
        where: { id: approvalToUpdateId },
        data: {
          decision,
          note: note ?? null,
          decidedAt: new Date(),
          approverId: userId,
        },
      });

      // status request jadi final berdasarkan keputusan yang diambil (Kasubag atau Kabag)
      await tx.request.update({
        where: { id: requestId },
        data: {
          status: decision,
          rejectionNote: decision === "REJECTED" ? note ?? null : null,
        },
      });
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/approval error:", err);
    return jsonError("Terjadi kesalahan pada server", 500);
  }
}
