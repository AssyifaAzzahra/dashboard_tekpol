import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ApprovalClient from "./view-client";

type Role = "PKWT" | "KARYAWAN" | "KASUBAG" | "KABAG" | "GUEST";
type Decision = "PENDING" | "APPROVED" | "REJECTED";
type Category = "HO" | "REGIONAL";
type App = { id: string; name: string; category: Category; username: string; password: string; description?: string | null };
type User = { id: string; name: string; email?: string | null };
type Approval = { id: string; requestId: string; approverId: string; role: Role; decision: Decision; note?: string | null; decidedAt?: string | Date | null; approver?: User };
type Request = { id: string; type: "PKWT" | "GUEST"; appId: string; requesterId: string; picId?: string | null; reason?: string | null; division?: string | null; status: Decision; rejectionNote?: string | null };
type Row = Request & { app: App; requester: User; approvals: (Approval & { approver: User })[]; pic: User | null };

export default async function ApprovalPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const role = (session.user?.role ?? "GUEST") as Role;
  const userId = session.user?.id;

  const whereByRole: Record<string, unknown> =
    role === "KARYAWAN" ? { type: "PKWT", picId: userId }
      : role === "KASUBAG" || role === "KABAG" ? { type: "GUEST" }
        : { id: "__none__" };

  const rows = await prisma.request.findMany({
    where: whereByRole,
    include: { app: true, requester: true, approvals: { include: { approver: true } }, pic: true },
    orderBy: { createdAt: "desc" },
  });

  return <ApprovalClient role={role} rows={rows as Row[]} />;
}
