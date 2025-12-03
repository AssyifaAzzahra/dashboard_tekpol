import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Tipe lokal (jangan bergantung ke @prisma/client)
type Role = "PKWT" | "KARYAWAN" | "KASUBAG" | "KABAG" | "GUEST";
type RequestType = "PKWT" | "GUEST";
type Decision = "PENDING" | "APPROVED" | "REJECTED";

const PKWTReq = z.object({
  type: z.literal("PKWT"),
  appId: z.string().min(1),
  picId: z.string().min(1),
});

const GuestReq = z.object({
  type: z.literal("GUEST"),
  appId: z.string().min(1),
  name: z.string().min(1),
  division: z.string().min(1),
  reason: z.string().min(5),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user?.id;
  const reqs = await prisma.request.findMany({
    where: { requesterId: userId ?? undefined },
    include: { app: true, approvals: true, pic: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reqs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user?.role as Role | undefined;
  const userId = session.user?.id;
  if (!userId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const body = await req.json();

  // PKWT membuat request → butuh PIC
  if (role === "PKWT") {
    const parsed = PKWTReq.safeParse(body);
    if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

    const created = await prisma.request.create({
      data: {
        type: "PKWT" satisfies RequestType,
        requesterId: userId,
        appId: parsed.data.appId,
        picId: parsed.data.picId,
        status: "PENDING" as Decision,
        approvals: {
          create: {
            approverId: parsed.data.picId,
            role: "KARYAWAN",
            decision: "PENDING",
          },
        },
      },
      include: { app: true, approvals: true, pic: true },
    });
    return NextResponse.json(created, { status: 201 });
  }

  // Guest (atau belum ada role → anggap guest)
  if (!role || role === "GUEST") {
    const parsed = GuestReq.safeParse(body);
    if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

    // pastikan user (guest) punya nama di DB
    await prisma.user.upsert({
      where: { id: userId },
      update: { name: parsed.data.name },
      create: { id: userId, name: parsed.data.name, role: "GUEST" },
    });

    const kasubag = await prisma.user.findFirst({ where: { role: "KASUBAG" } });
    const kabag = await prisma.user.findFirst({ where: { role: "KABAG" } });
    if (!kasubag || !kabag) {
      return NextResponse.json({ error: "Approver belum diset" }, { status: 400 });
    }

    const created = await prisma.request.create({
      data: {
        type: "GUEST" satisfies RequestType,
        requesterId: userId,
        appId: parsed.data.appId,
        reason: parsed.data.reason,
        division: parsed.data.division,
        status: "PENDING" as Decision,
        approvals: {
          create: [
            { approverId: kasubag.id, role: "KASUBAG", decision: "PENDING" },
            { approverId: kabag.id, role: "KABAG", decision: "PENDING" },
          ],
        },
      },
      include: { app: true, approvals: true, pic: true },
    });

    return NextResponse.json(created, { status: 201 });
  }

  return NextResponse.json({ error: "Role tidak diizinkan membuat request." }, { status: 403 });
}
