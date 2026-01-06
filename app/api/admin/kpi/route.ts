// app/api/admin/kpi/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/lib/admin";

export async function GET() {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalAll,
    totalToday,
    totalMonth,
    pendingAll,
    approvedAll,
    rejectedAll,
    pendingList,
  ] = await Promise.all([
    prisma.request.count(),
    prisma.request.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.request.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.request.count({ where: { status: "PENDING" } }),
    prisma.request.count({ where: { status: "APPROVED" } }),
    prisma.request.count({ where: { status: "REJECTED" } }),
    prisma.request.findMany({
      where: { status: "PENDING" },
      include: { app: true, requester: true, pic: true, approvals: { include: { approver: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return NextResponse.json({
    kpi: {
      totalAll,
      totalToday,
      totalMonth,
      pendingAll,
      approvedAll,
      rejectedAll,
    },
    pendingList,
  });
}
