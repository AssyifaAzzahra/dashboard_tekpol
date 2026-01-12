// app/api/guest-requests/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RequestType, Role } from "@prisma/client";
import { z } from "zod";

// Skema body permohonan tamu
const GuestRequestSchema = z.object({
  guestName: z.string().min(1, "Nama tamu wajib diisi"),
  appName: z.string().min(1, "Nama aplikasi wajib diisi"),
  division: z.string().optional(),
  reason: z.string().optional(),
});

// Generator kode tracking (8 karakter huruf/angka, tanpa karakter yang mirip)
function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// PIN 4 digit
function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = GuestRequestSchema.safeParse(json);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Data tidak valid";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { guestName, appName, division, reason } = parsed.data;

    // ✅ 1) Cari App berdasarkan name (HARUS SUDAH ADA)
    const app = await prisma.app.findFirst({
      where: { name: appName.trim() },
      select: { id: true, name: true, url: true },
    });

    if (!app) {
      return NextResponse.json(
        { message: `Aplikasi "${appName.trim()}" belum terdaftar. Hubungi admin untuk menambahkan aplikasi.` },
        { status: 400 }
      );
    }

    // Optional: paksa app harus punya url
    if (!app.url || !app.url.trim()) {
      return NextResponse.json(
        { message: `Aplikasi "${app.name}" belum memiliki URL. Hubungi admin untuk melengkapi link aplikasi.` },
        { status: 400 }
      );
    }

    // ✅ 2) Generate trackingCode unik
    let trackingCode = generateTrackingCode();
    while (await prisma.request.findFirst({ where: { trackingCode }, select: { id: true } })) {
      trackingCode = generateTrackingCode();
    }

    const trackingPin = generatePin();

    // ✅ 3) Buat Request + Approval untuk KASUBAG & KABAG dalam satu transaksi
    const created = await prisma.$transaction(async (tx) => {
      const reqRow = await tx.request.create({
        data: {
          type: RequestType.GUEST,
          appId: app.id,
          guestName: guestName.trim(),
          division: division?.trim() || undefined,
          reason: reason?.trim() || undefined,
          trackingCode,
          trackingPin,
        },
        select: {
          id: true,
          trackingCode: true,
          trackingPin: true,
          createdAt: true,
        },
      });

      const approvers = await tx.user.findMany({
        where: { role: { in: [Role.KASUBAG, Role.KABAG] } },
        select: { id: true, role: true },
      });

      if (approvers.length > 0) {
        await tx.approval.createMany({
          data: approvers.map((u) => ({
            requestId: reqRow.id,
            approverId: u.id,
            role: u.role,
          })),
        });
      }

      return reqRow;
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("Error creating guest request:", err);
    return NextResponse.json({ message: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
