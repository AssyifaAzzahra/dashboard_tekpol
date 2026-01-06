// app/api/admin/requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/lib/admin";
import { z } from "zod";
import { writeAuditLog } from "@/lib/audit";
import type { Prisma, Category, Decision, RequestType } from "@prisma/client";

// ------------ helpers (query parsing) ------------
const StatusSchema = z.union([
  z.literal("ALL"),
  z.literal("PENDING"),
  z.literal("APPROVED"),
  z.literal("REJECTED"),
]);
const TypeSchema = z.union([z.literal("ALL"), z.literal("PKWT"), z.literal("GUEST")]);
const CategorySchema = z.union([z.literal("ALL"), z.literal("HO"), z.literal("REGIONAL")]);

function toDecision(v: z.infer<typeof StatusSchema>): Decision | undefined {
  return v === "ALL" ? undefined : v;
}
function toRequestType(v: z.infer<typeof TypeSchema>): RequestType | undefined {
  return v === "ALL" ? undefined : v;
}
function toCategory(v: z.infer<typeof CategorySchema>): Category | undefined {
  return v === "ALL" ? undefined : v;
}

// ------------ GET ------------
export async function GET(req: NextRequest) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const { searchParams } = new URL(req.url);

  // ===== DETAIL MODE: /api/admin/requests?id=xxxxx =====
  const id = (searchParams.get("id") ?? "").trim();
  if (id) {
    const reqData = await prisma.request.findUnique({
      where: { id },
      include: {
        app: true,
        requester: true,
        pic: true,
      },
    });

    if (!reqData) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const approvals = await prisma.approval.findMany({
      where: { requestId: id },
      include: { approver: true },
      orderBy: { decidedAt: "asc" }, // bisa null, tapi tetap aman untuk sort
    });

    return NextResponse.json({ ...reqData, approvals });
  }

  // ===== LIST MODE: /api/admin/requests?q=...&status=... =====
  const q = (searchParams.get("q") ?? "").trim();

  const statusRaw =
    StatusSchema.safeParse(searchParams.get("status") ?? "ALL").success
      ? (searchParams.get("status") as z.infer<typeof StatusSchema>)
      : "ALL";

  const typeRaw =
    TypeSchema.safeParse(searchParams.get("type") ?? "ALL").success
      ? (searchParams.get("type") as z.infer<typeof TypeSchema>)
      : "ALL";

  const categoryRaw =
    CategorySchema.safeParse(searchParams.get("category") ?? "ALL").success
      ? (searchParams.get("category") as z.infer<typeof CategorySchema>)
      : "ALL";

  const picId = searchParams.get("picId") ?? "ALL";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Prisma.RequestWhereInput = {};

  const decision = toDecision(statusRaw);
  if (decision) where.status = decision;

  const reqType = toRequestType(typeRaw);
  if (reqType) where.type = reqType;

  if (picId !== "ALL") where.picId = picId;

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const cat = toCategory(categoryRaw);
  if (cat) {
    where.app = { is: { category: cat } };
  }

  if (q) {
    where.OR = [
      { id: { contains: q, mode: "insensitive" } },
      { reason: { contains: q, mode: "insensitive" } },
      { division: { contains: q, mode: "insensitive" } },
      { guestName: { contains: q, mode: "insensitive" } },
      { trackingCode: { contains: q, mode: "insensitive" } },
      { guestEmail: { contains: q, mode: "insensitive" } },
      { app: { is: { name: { contains: q, mode: "insensitive" } } } },
      { requester: { is: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }

  const data = await prisma.request.findMany({
    where,
    include: {
      app: true,
      requester: true,
      pic: true,
      approvals: { include: { approver: true } }, // list boleh tanpa order
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(data);
}

// ------------ PATCH ------------
const PatchSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("ASSIGN_PIC"),
    requestId: z.string().min(1),
    picId: z.string().min(1),
  }),
  z.object({
    mode: z.literal("DECIDE"),
    requestId: z.string().min(1),
    decision: z.enum(["APPROVED", "REJECTED"]),
    note: z.string().optional(),
  }),
]);

export async function PATCH(req: NextRequest) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const actorId = guard.session.user?.id ?? null;
  const actorEmail = (guard.session.user?.email ?? null) as string | null;

  const parsed = PatchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json(parsed.error, { status: 400 });

  // 1) Assign PIC
  if (parsed.data.mode === "ASSIGN_PIC") {
    const before = await prisma.request.findUnique({
      where: { id: parsed.data.requestId },
      select: { id: true, picId: true },
    });
    if (!before) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    const updated = await prisma.request.update({
      where: { id: parsed.data.requestId },
      data: { picId: parsed.data.picId },
      include: { app: true, requester: true, pic: true, approvals: true },
    });

    await writeAuditLog({
      action: "ASSIGN_PIC",
      entity: "Request",
      entityId: updated.id,
      actorId,
      actorEmail,
      meta: { before: { picId: before.picId }, after: { picId: updated.picId } },
    });

    return NextResponse.json(updated);
  }

  // 2) DECIDE (approve/reject override)
  const { requestId, decision, note } = parsed.data;

  const reqBefore = await prisma.request.findUnique({
    where: { id: requestId },
    select: { id: true, status: true, rejectionNote: true },
  });
  if (!reqBefore) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  const updated = await prisma.$transaction(async (tx) => {
    await tx.approval.updateMany({
      where: { requestId, decision: "PENDING" },
      data: {
        decision,
        note: note ?? null,
        decidedAt: new Date(),
      },
    });

    return tx.request.update({
      where: { id: requestId },
      data: {
        status: decision,
        rejectionNote: decision === "REJECTED" ? (note ?? null) : null,
      },
      include: {
        app: true,
        requester: true,
        pic: true,
        approvals: { include: { approver: true } },
      },
    });
  });

  await writeAuditLog({
    action: decision === "APPROVED" ? "APPROVE_REQUEST" : "REJECT_REQUEST",
    entity: "Request",
    entityId: updated.id,
    actorId,
    actorEmail,
    meta: {
      before: { status: reqBefore.status, rejectionNote: reqBefore.rejectionNote },
      after: { status: updated.status, rejectionNote: updated.rejectionNote },
      note: note ?? null,
    },
  });

  return NextResponse.json(updated);
}
