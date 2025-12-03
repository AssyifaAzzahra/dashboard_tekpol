import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppsClient from "./view-client";

type Role = "PKWT" | "KARYAWAN" | "KASUBAG" | "KABAG" | "GUEST";
type Decision = "PENDING" | "APPROVED" | "REJECTED";
type Category = "HO" | "REGIONAL";
type App = { id: string; name: string; category: Category; username: string; password: string; description?: string | null };
type User = { id: string; name: string; email?: string | null };
type Request = { id: string; appId: string; status: Decision; type: "PKWT" | "GUEST"; rejectionNote?: string | null; pic?: User | null };
type MyReq = Request & { app: App; pic: User | null };

export default async function CredentialsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const role = (session.user?.role ?? "GUEST") as Role;
  const userId = session.user?.id;

  const [apps, myReqs, pics] = await Promise.all([
    prisma.app.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] }),
    prisma.request.findMany({
      where: { requesterId: userId ?? undefined },
      include: { app: true, approvals: true, pic: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({ where: { role: "KARYAWAN", isPic: true }, orderBy: { name: "asc" } }),
  ]);

  return <AppsClient role={role} apps={apps as App[]} myReqs={myReqs as MyReq[]} pics={pics as User[]} />;
}
