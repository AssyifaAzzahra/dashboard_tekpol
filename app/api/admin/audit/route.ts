// app/api/admin/audit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/lib/admin";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const guard = await requireSuperadmin();
  if (!guard.ok) return guard.res;

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  const where: Prisma.AuditLogWhereInput = {};

  if (q) {
    where.OR = [
      { action: { contains: q, mode: "insensitive" } },
      { entity: { contains: q, mode: "insensitive" } },
      { entityId: { contains: q, mode: "insensitive" } },
      { actorEmail: { contains: q, mode: "insensitive" } },
    ];
  }

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 300,
  });

  return NextResponse.json(logs);
}
