// app/api/approval/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

type Role = "PKWT" | "KARYAWAN" | "KASUBAG" | "KABAG" | "GUEST";

const PatchBody = z.object({
  id: z.string().min(1),
  decision: z.preprocess(
    (v) => (typeof v === "string" ? v.toUpperCase() : v),
    z.enum(["APPROVED", "REJECTED"])
  ),
  note: z.string().optional().default(""),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user.role ?? "GUEST") as Role;
  const userId = session.user.id;

  // filter request berdasarkan role
  let where: Record<string, unknown> = { id: "__none__" };
  if (role === "KARYAWAN") where = { type: "PKWT", picId: userId };
  else if (role === "KASUBAG" || role === "KABAG") where = { type: "GUEST" };

  const rows = await prisma.request.findMany({
    where,
    include: {
      app: true,
      requester: true,
      approvals: { include: { approver: true } },
      pic: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(rows);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
  }
  const parsed = PatchBody.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
  }

  const { id, decision, note } = parsed.data;
  const role = (session.user.role ?? "GUEST") as Role;
  const userId = session.user.id;

  const requestRow = await prisma.request.findUnique({
    where: { id },
    include: { approvals: true },
  });
  if (!requestRow) {
    return NextResponse.json({ error: "Request tidak ditemukan" }, { status: 404 });
  }

  // cari baris approval sesuai role user
  const myApproval = requestRow.approvals.find((a) => {
    if (role === "KARYAWAN") return a.role === "KARYAWAN" && a.approverId === userId;
    if (role === "KASUBAG") return a.role === "KASUBAG";
    if (role === "KABAG") return a.role === "KABAG";
    return false;
  });
  if (!myApproval) {
    return NextResponse.json(
      { error: "Anda tidak berhak meng-approve request ini" },
      { status: 403 }
    );
  }

  await prisma.approval.update({
    where: { id: myApproval.id },
    data: { decision, note, decidedAt: new Date() },
  });

  // Jika reject -> request langsung REJECTED
  if (decision === "REJECTED") {
    const updated = await prisma.request.update({
      where: { id },
      data: { status: "REJECTED", rejectionNote: note },
    });
    return NextResponse.json(updated);
  }

  // Jika approve
  if (requestRow.type === "PKWT") {
    // PKWT: cukup PIC setujui
    const updated = await prisma.request.update({
      where: { id },
      data: { status: "APPROVED" },
    });
    return NextResponse.json(updated);
  } else {
    // GUEST: perlu KASUBAG & KABAG Approved
    const approvals = await prisma.approval.findMany({ where: { requestId: id } });
    const bothApproved = approvals
      .filter((a) => a.role === "KASUBAG" || a.role === "KABAG")
      .every((a) => a.decision === "APPROVED");

    const updated = await prisma.request.update({
      where: { id },
      data: { status: bothApproved ? "APPROVED" : "PENDING" },
    });
    return NextResponse.json(updated);
  }
}
