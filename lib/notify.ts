import nodemailer from "nodemailer";

function envBool(v: string | undefined) {
  return v === "true" || v === "1";
}

export async function notifyAdminNewPksDoc(params: {
  pksCode: string;
  pksName?: string | null;
  originalName: string;
  fileUrl: string;
  uploaderEmail?: string | null;
}) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const secure = envBool(process.env.SMTP_SECURE);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  // email admin tujuan (buat variabel sendiri biar jelas)
  const adminTo = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER;

  // kalau SMTP belum di-set, jangan crash
  if (!host || !port || !user || !pass || !from || !adminTo) {
    console.warn("⚠️ SMTP/ADMIN_NOTIFY_EMAIL belum lengkap, skip kirim email.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  const subject = `Dokumen PKS Masuk - ${params.pksCode}${params.pksName ? " (" + params.pksName + ")" : ""}`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const fullLink = `${baseUrl}${params.fileUrl}`;

  const text =
    `Dokumen baru masuk.\n\n` +
    `PKS: ${params.pksCode} ${params.pksName ? "- " + params.pksName : ""}\n` +
    `File: ${params.originalName}\n` +
    `Uploader: ${params.uploaderEmail ?? "-"}\n\n` +
    `Link file: ${fullLink}\n` +
    `Admin panel: ${baseUrl}/admin/pks-documents\n`;

  await transporter.sendMail({
    from,
    to: adminTo,
    subject,
    text,
  });
}
