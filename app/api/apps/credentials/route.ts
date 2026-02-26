import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Role =
  | "PKWT"
  | "KARYAWAN"
  | "KASUBAG"
  | "KABAG"
  | "GUEST"
  | "SUPERADMIN"
  | "ADMIN";

export async function GET() {
  const session = await getServerSession(authOptions);

  const userId = (session?.user as any)?.id as string | undefined;
  const role = ((session?.user as any)?.role ?? "GUEST") as Role;
  const currentUserName = (session?.user as any)?.name ?? "";

  // ✅ wajib login (kalau tidak, redirect ke login dilakukan di client)
  if (!userId) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        role: "GUEST" as Role,
        currentUserName: "",
        apps: [],
        myReqs: [],
        pics: [],
      },
      { status: 401 }
    );
  }

  // ✅ sesuai Sidebar kamu: semua role selain GUEST boleh buka menu
  const canOpenMenu =
    role === "SUPERADMIN" ||
    role === "ADMIN" ||
    role === "PKWT" ||
    role === "KARYAWAN" ||
    role === "KASUBAG" ||
    role === "KABAG";

  if (!canOpenMenu) {
    return NextResponse.json(
      {
        error: "Forbidden",
        role,
        currentUserName,
        apps: [],
        myReqs: [],
        pics: [],
      },
      { status: 403 }
    );
  }

  // ✅ hanya role ini yang boleh lihat username/password mentah
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

  // ✅ kalau tidak boleh lihat creds -> sensor
  const apps = appsRaw.map((a) => ({
    ...a,
    username: canSeeCreds ? a.username : null,
    password: canSeeCreds ? a.password : null,
  }));

  // ✅ request milik user (dipakai kalau nanti mau tampil status request)
  const myReqs = await prisma.request.findMany({
    where: { requesterId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      appId: true,
      status: true,
      reason: true,
      division: true,
      createdAt: true,
      updatedAt: true,
      rejectionNote: true,
      trackingCode: true,
      trackingPin: true,
      guestName: true,
      guestEmail: true,
    },
  });

  // ✅ list PIC (kalau nanti dipakai)
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

  // ✅ payload lengkap yang dibutuhkan AppsClient/InfoLoginSection
  return NextResponse.json({
    role,
    currentUserName,
    apps,
    myReqs,
    pics,
  });
}