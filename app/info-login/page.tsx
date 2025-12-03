import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "./logout-client";

// Tipe lokal supaya tidak bergantung pada @prisma/client saat build
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

type User = {
  id: string;
  name: string;
  email?: string | null;
};

type Approval = {
  id: string;
  requestId: string;
  approverId: string;
  role: Role;
  decision: Decision;
  note?: string | null;
  decidedAt?: Date | null;
  approver?: User | null;
};

type Request = {
  id: string;
  type: "PKWT" | "GUEST";
  appId: string;
  requesterId: string;
  picId?: string | null;
  reason?: string | null;
  division?: string | null;
  status: Decision;
  rejectionNote?: string | null;
};

type MyReq = Request & { app: App; approvals: Approval[]; pic: User | null };

import AppsClient from "@/app/apps/credentials/view-client";
import RequestFormClient from "./request-form-client";

export default async function InfoLoginPage() {
  const session = await getServerSession(authOptions);
  // proxy.ts / middleware harus sudah mengarahkan ke /login jika belum login
  if (!session) return null;

  // ⬇️ gunakan role dari session.user.role (BUKAN session.role)
  const role = (session.user?.role ?? "GUEST") as Role;
  const userId = session.user?.id;

  // Data umum
  const [apps, pics] = await Promise.all([
    prisma.app.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
    prisma.user.findMany({ where: { role: "KARYAWAN", isPic: true }, orderBy: { name: "asc" } }),
  ]);

  // Data request milik user (untuk status & popup approved)
  const myReqs = await prisma.request.findMany({
    where: { requesterId: userId ?? undefined },
    include: { app: true, approvals: true, pic: true },
    orderBy: { createdAt: "desc" },
  });

  // ===== Header dengan Logout (terlihat untuk semua role) =====
  const Header = (
    <div className="mx-auto max-w-5xl w-full px-4 mb-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-wide text-slate-500">Info Login</div>
          <div className="text-lg font-semibold truncate">
            Selamat datang{session.user?.name ? `, ${session.user.name}` : ""} —{" "}
            <span className="text-emerald-600">{role}</span>
          </div>
        </div>
        <LogoutButton />
      </div>
    </div>
  );

  // STAFF: langsung tampilkan kredensial
  if (role === "KARYAWAN" || role === "KASUBAG" || role === "KABAG") {
    return (
      <>
        {Header}
        <AppsClient
          role={role}
          apps={apps as App[]}
          myReqs={myReqs as MyReq[]}
          pics={pics as User[]}
        />
      </>
    );
  }

  // PKWT & GUEST: tampilkan form permohonan
  return (
    <>
      {Header}
      <RequestFormClient
        role={role}
        apps={apps as App[]}
        pics={pics as User[]}
        myReqs={myReqs as MyReq[]}
        userName={session.user?.name ?? ""}
      />
    </>
  );
}
