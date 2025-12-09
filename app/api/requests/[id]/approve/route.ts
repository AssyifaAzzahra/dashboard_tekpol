// src/app/api/requests/[id]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendCredentialEmail } from "@/lib/email"; // ⬅️ helper kirim email yg sudah kita buat sebelumnya

type Decision = "PENDING" | "APPROVED" | "REJECTED";

const Body = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ⬅️ sesuai Next.js 15/16: params adalah Promise
  const { id } = await params;

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

  // 🧠 Kita pakai transaction seperti sebelumnya, tapi
  // sekarang transaction akan "mengembalikan" Request yang
  // status-nya benar-benar berubah menjadi APPROVED (kalau ada).
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
      // ❌ Kalau ada yang REJECTED → request REJECTED
      await tx.request.update({
        where: { id: requestData.id },
        data: {
          status: "REJECTED",
          rejectionNote: note || null,
        },
      });

      return null; // tidak perlu kirim credential
    }

    const allApproved = approvals.every(
      (a: { decision: Decision }) => a.decision === "APPROVED"
    );

    if (allApproved) {
      // ✅ Semua approver sudah APPROVED → Request jadi APPROVED
      // SEKALIGUS kita include app & requester supaya bisa kirim email di luar transaction
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

      return updated; // ⬅️ ini yang nanti kita pakai kirim credential
    } else {
      // Masih ada yang pending → status tetap PENDING
      await tx.request.update({
        where: { id: requestData.id },
        data: {
          status: "PENDING",
        },
      });

      return null;
    }
  });

  // 3️⃣ Setelah transaction selesai, kalau updatedRequestForEmail
  //    tidak null dan status-nya APPROVED → kirim username/password
  if (updatedRequestForEmail && updatedRequestForEmail.status === "APPROVED") {
    const req = updatedRequestForEmail;

    // Tentukan email tujuan:
    // - kalau requester (user login) punya email → pakai itu
    // - kalau tidak, pakai guestEmail di Request
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
        // kita tidak mengubah status APPROVED walaupun email gagal
      }
    } else {
      console.warn(
        `Request ${req.id} APPROVED tetapi tidak ada email tujuan atau app.`
      );
    }
  }

  return NextResponse.json({ ok: true });
}
