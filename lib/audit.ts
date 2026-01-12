import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function writeAuditLog(params: {
  action: string;
  entity: string;
  entityId?: string | null;
  actorId?: string | null;
  actorEmail?: string | null;
  meta?: Prisma.InputJsonValue;
}) {
  const { action, entity, entityId, actorId, actorEmail, meta } = params;

  await prisma.auditLog.create({
    data: {
      action,
      entity,
      entityId: entityId ?? null,
      actorId: actorId ?? null,
      actorEmail: actorEmail ?? null,
      ...(meta === undefined ? {} : { meta }),
    },
  });
}
