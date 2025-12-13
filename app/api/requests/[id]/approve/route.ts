// src/app/api/requests/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendCredentialEmail } from "@/lib/email";

type Decision = "PENDING" | "APPROVED" | "REJECTED";
type Role = "PKWT" | "KARYAWAN" | "KASUBAG" | "KABAG" | "GUEST";

const Body = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const approverId = session.user?.id;
  const role = session.user?.role as Role | undefined;
  if (!approverId || !role) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }

  const { decision, note } = Body.parse(await request.json());

  const requestData = await prisma.request.findUnique({
    where: { id },
    include: { approvals: true }, // scalar fields (type, etc) tetap ikut
  });

  if (!requestData) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // 🔑 Bedakan: PKWT (PIC) vs GUEST (KASUBAG/KABAG)
  const isGuest = requestData.type === "GUEST";

  const approval = await prisma.approval.findFirst({
    where: isGuest
      ? {
          requestId: requestData.id,
          role, // siapa pun yang login dengan role ini bisa approve
        }
      : {
          requestId: requestData.id,
          approverId, // untuk PKWT, tetap harus PIC yang benar
        },
  });

  if (!approval) {
    return NextResponse.json(
      { error: "Tidak berwenang approve request ini." },
      { status: 403 }
    );
  }

  // 🧠 Transaction + hitung status + optional kirim email
  const updatedRequestForEmail = await prisma.$transaction(async (tx) => {
    // 1️⃣ Update record Approval untuk approver ini
    await tx.approval.update({
      where: { id: approval.id },
      data: {
        decision,
        note,
        decidedAt: new Date(),
      },
    });

    // 2️⃣ Ambil semua approval setelah di-update
    const approvals = await tx.approval.findMany({
      where: { requestId: requestData.id },
    });

    const anyRejected = approvals.some(
      (a: { decision: Decision }) => a.decision === "REJECTED"
    );
    if (anyRejected) {
      await tx.request.update({
        where: { id: requestData.id },
        data: {
          status: "REJECTED",
          rejectionNote: note || null,
        },
      });

      return null;
    }

    const allApproved = approvals.every(
      (a: { decision: Decision }) => a.decision === "APPROVED"
    );

    if (allApproved) {
      const updated = await tx.request.update({
        where: { id: requestData.id },
        data: {
          status: "APPROVED",
          rejectionNote: null,
        },
        include: {
          app: true,
          requester: true,
        },
      });

      return updated;
    } else {
      await tx.request.update({
        where: { id: requestData.id },
        data: {
          status: "PENDING",
        },
      });

      return null;
    }
  });

  // 3️⃣ Kirim credential kalau request final APPROVED
  if (updatedRequestForEmail && updatedRequestForEmail.status === "APPROVED") {
    const req = updatedRequestForEmail;

    const emailTujuan = req.requester?.email ?? req.guestEmail ?? null;

    if (emailTujuan && req.app) {
      try {
        await sendCredentialEmail({
          to: emailTujuan,
          guestName: req.guestName ?? req.requester?.name ?? undefined,
          appName: req.app.name,
          appUsername: req.app.username,
          appPassword: req.app.password,
        });
      } catch (err) {
        console.error(
          `Gagal mengirim email credential untuk request ${req.id}:`,
          err
        );
      }
    } else {
      console.warn(
        `Request ${req.id} APPROVED tetapi tidak ada email tujuan atau app.`
      );
    }
  }

  return NextResponse.json({ ok: true });
}
