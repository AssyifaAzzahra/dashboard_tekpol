// app/api/guest-requests/status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RequestType, Decision, Role } from "@prisma/client";
import { z } from "zod";

const StatusRequestSchema = z.object({
  trackingCode: z.string().min(1, "Kode permohonan wajib diisi"),
  trackingPin: z.string().min(1, "PIN permohonan wajib diisi"),
});

/**
 * Tipe lokal yang mencerminkan struktur Request versi baru
 * (ada guestName, trackingCode, trackingPin, approvals + approver).
 * Ini tidak bergantung pada tipe Prisma, jadi TS tidak komplain.
 */
type RequestWithGuestAndApprovals = {
  id: string;
  type: RequestType;
  requesterId: string | null;
  appId: string;
  picId: string | null;
  reason: string | null;
  division: string | null;
  status: Decision;
  createdAt: Date;
  updatedAt: Date;
  rejectionNote: string | null;
  guestName: string | null;
  trackingCode: string | null;
  trackingPin: string | null;
  approvals: {
    id: string;
    role: Role;
    decision: Decision;
    note: string | null;
    decidedAt: Date | null;
    approver: {
      id: string;
      name: string;
      email: string | null;
    };
  }[];
};

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = StatusRequestSchema.safeParse(json);

    if (!parsed.success) {
      const firstError =
        parsed.error.issues[0]?.message || "Data tidak valid";
      return NextResponse.json(
        { message: firstError },
        { status: 400 }
      );
    }

    const { trackingCode, trackingPin } = parsed.data;

    // 👉 Prisma client kamu belum kenal field trackingCode/trackingPin,
    // jadi kita buat object where sebagai `any` supaya TS tidak cek propertinya.
    const where: any = {
      trackingCode,
      trackingPin,
      type: RequestType.GUEST,
    };

    // 1️⃣ Ambil request + approvals
    const raw = await prisma.request.findFirst({
      where,
      include: {
        approvals: {
          include: { approver: true },
          orderBy: { decidedAt: "asc" },
        },
      },
    });

    // cast ke tipe lokal supaya boleh pakai guestName/trackingCode/dll
    const request = raw as RequestWithGuestAndApprovals | null;

    if (!request) {
      return NextResponse.json(
        { message: "Kode atau PIN tidak ditemukan" },
        { status: 404 }
      );
    }

    // 2️⃣ Ambil data App berdasarkan appId
    const app = await prisma.app.findUnique({
      where: { id: request.appId },
    });

    if (!app) {
      return NextResponse.json(
        { message: "Aplikasi untuk permohonan ini tidak ditemukan" },
        { status: 500 }
      );
    }

    // 3️⃣ Hanya kalau status APPROVED, kirim username & password
    const credentials =
      request.status === Decision.APPROVED
        ? {
            username: app.username,
            password: app.password,
          }
        : null;

    // 4️⃣ Bentuk payload rapi untuk frontend /guest/track
    const payload = {
      id: request.id,
      guestName: request.guestName,
      trackingCode: request.trackingCode,
      division: request.division,
      reason: request.reason,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
      app: {
        id: app.id,
        name: app.name,
        category: app.category,
      },
      approvals: request.approvals.map((a) => ({
        id: a.id,
        role: a.role,
        decision: a.decision,
        decidedAt: a.decidedAt,
        note: a.note,
        approver: {
          id: a.approver.id,
          name: a.approver.name,
          email: a.approver.email,
        },
      })),
      // null kalau belum APPROVED, di-cek di frontend
      credentials,
    };

    return NextResponse.json(payload, { status: 200 });
  } catch (err) {
    console.error("Error checking guest request status:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
