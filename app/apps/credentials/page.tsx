import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppsClient from "./view-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Role =
  | "PKWT"
  | "KARYAWAN"
  | "KASUBAG"
  | "KABAG"
  | "GUEST"
  | "SUPERADMIN"
  | "ADMIN";

export default async function Page() {
  const session = await getServerSession(authOptions);

  const userId = (session?.user as any)?.id as string | undefined;
  const role = ((session?.user as any)?.role ?? "GUEST") as Role;
  const currentUserName = (session?.user as any)?.name ?? "";

  // ✅ kalau belum login -> ke login
  if (!userId) {
    redirect("/login");
  }

  // ✅ sesuai menu Sidebar kamu: selain GUEST boleh buka halaman
  const canOpenMenu =
    role === "SUPERADMIN" ||
    role === "ADMIN" ||
    role === "PKWT" ||
    role === "KARYAWAN" ||
    role === "KASUBAG" ||
    role === "KABAG";

  if (!canOpenMenu) {
    // kalau role tidak boleh, kembali ke dashboard
    redirect("/dashboard");
  }

  // ✅ hanya KARYAWAN/SUPERADMIN boleh lihat username/password
  const canSeeCreds = role === "KARYAWAN" || role === "SUPERADMIN";

  // ✅ ambil apps dari DB
  const appsRaw = await prisma.app.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      category: true,
      url: true,
      description: true,
      logoUrl: true,
      username: true,
      password: true,
    },
  });

  // ✅ sanitasi creds untuk role non-karyawan/superadmin
  const apps = appsRaw.map((a) => ({
    ...a,
    username: canSeeCreds ? a.username : null,
    password: canSeeCreds ? a.password : null,
  }));

  // ✅ my requests (include relasi supaya cocok dengan types di app/apps/credentials/types.ts)
  const myReqs = await prisma.request.findMany({
    where: { requesterId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      app: true,
      approvals: { include: { approver: true } },
      pic: true,
    },
  });

  // ✅ list PIC (opsional, tetap kita kirim)
  const pics = await prisma.user.findMany({
    where: { isPic: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      sapNo: true,
      role: true,
      isPic: true,
      pksCode: true,
    },
  });

  return (
    <AppsClient
      role={role as any}
      apps={apps as any}
      myReqs={myReqs as any}
      pics={pics as any}
      currentUserName={currentUserName}
    />
  );
}