// app/approval/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ApprovalClient from "./view-client";

type Role = "PKWT" | "KARYAWAN" | "KASUBAG" | "KABAG" | "GUEST";
type Decision = "PENDING" | "APPROVED" | "REJECTED";
type Category = "HO" | "REGIONAL";

type App = {
  id: string;
  name: string;
  category: Category;
  username: string;
  password: string;
  description?: string | null;
};

type User = { id: string; name: string; email?: string | null };

type Approval = {
  id: string;
  requestId: string;
  approverId: string;
  role: Role;
  decision: Decision;
  note?: string | null;
  decidedAt?: string | Date | null;
  approver?: User;
};

type Request = {
  id: string;
  type: "PKWT" | "GUEST";
  appId: string;
  requesterId: string | null;
  guestName?: string | null;
  picId?: string | null;
  reason?: string | null;
  division?: string | null;
  status: Decision;
  rejectionNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type Row = Request & {
  app: App;
  requester?: User | null;
  approvals: (Approval & { approver: User })[];
  pic: User | null;
};

type RowPlain = Omit<Row, "createdAt" | "updatedAt" | "approvals"> & {
  createdAt: string;
  updatedAt: string;
  approvals: (Omit<Approval, "decidedAt"> & { decidedAt: string | null } & { approver: User })[];
};

function hasValidId(x: { id: unknown }): x is { id: string } {
  return typeof x.id === "string" && x.id.trim().length > 0;
}

export default async function ApprovalPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const role = (session.user?.role ?? "GUEST") as Role;
  const userId = session.user?.id ?? null;

  // whereByRole (tanpa unknown/any)
  const whereByRole =
    role === "KARYAWAN" && userId
      ? ({ type: "PKWT", picId: userId } as const)
      : role === "KASUBAG" || role === "KABAG"
      ? ({ type: "GUEST" } as const)
      : ({ id: "__none__" } as const);

  const rows = (await prisma.request.findMany({
    where: whereByRole,
    include: {
      app: true,
      requester: true,
      approvals: { include: { approver: true } },
      pic: true,
    },
    orderBy: { createdAt: "desc" },
  })) as Row[];

  const rowsPlain: RowPlain[] = rows
    .filter((r) => hasValidId(r))
    .map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      approvals: r.approvals.map((a) => ({
        ...a,
        decidedAt: a.decidedAt ? new Date(a.decidedAt).toISOString() : null,
      })),
    }));

  return (
    <ApprovalClient
      role={role}
      rows={rowsPlain}
      onDone={async () => {
        // Refresh penuh (server component) biar list terbaru muncul
        // Kalau kamu pakai router.refresh() di client juga bisa, tapi ini aman.
      }}
    />
  );
}
