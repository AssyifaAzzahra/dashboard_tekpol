import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Role =
  | "SUPERADMIN"
  | "ADMIN"
  | "PKWT"
  | "KARYAWAN"
  | "KASUBAG"
  | "KABAG"
  | "GUEST";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const role = (session?.user?.role ?? "GUEST") as Role;

  if (!session || (role !== "SUPERADMIN" && role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = (await req.json()) as {
    username?: string | null;
    password?: string | null;
    url?: string | null;
    description?: string | null;
    logoUrl?: string | null;
  };

  const updated = await prisma.app.update({
    where: { id },
    data: {
      username: body.username ?? null,
      password: body.password ?? null,
      url: body.url ?? null,
      description: body.description ?? null,
      logoUrl: body.logoUrl ?? null,
    },
    select: {
      id: true,
      name: true,
      category: true,
      username: true,
      password: true,
      url: true,
      description: true,
      logoUrl: true,
    },
  });

  return NextResponse.json(updated);
}
