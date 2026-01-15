import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperadmin } from "@/lib/auth-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireSuperadmin();

    const data = await prisma.pksDocumentSubmission.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        uploader: { select: { name: true, email: true } },
      },
      take: 500,
    });

    return NextResponse.json({ data });
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN_ADMIN_ONLY") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
