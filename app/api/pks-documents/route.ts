import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePksUser } from "@/lib/auth-guard";
import { getPksNameByCode } from "@/lib/pks-list";
import { saveUploadedFile } from "@/lib/upload-doc";
import { notifyAdminNewPksDoc } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { session, pksCode } = await requirePksUser();

    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File wajib diupload" }, { status: 400 });
    }

    const upload = await saveUploadedFile(file);
    const pksName = getPksNameByCode(pksCode);

    const created = await prisma.pksDocumentSubmission.create({
      data: {
        pksCode,
        pksName,
        fileUrl: upload.fileUrl,
        originalName: upload.originalName,
        mimeType: upload.mimeType,
        sizeBytes: upload.sizeBytes,
        uploaderId: session.user.id,
        status: "PENDING",
      },
      select: { id: true },
    });

    // email notif admin (tidak bikin gagal upload kalau email error)
    try {
      await notifyAdminNewPksDoc({
        pksCode,
        pksName,
        originalName: upload.originalName,
        fileUrl: upload.fileUrl,
        uploaderEmail: session.user.email ?? null,
      });
    } catch (e) {
      console.warn("⚠️ Gagal kirim email notif:", e);
    }

    return NextResponse.json({ ok: true, id: created.id });
  } catch (e: any) {
    const msg = String(e?.message || e);
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN_PKS_ONLY") return NextResponse.json({ error: "Hanya akun PKS" }, { status: 403 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
