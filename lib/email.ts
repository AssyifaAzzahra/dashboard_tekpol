// src/lib/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

type SendCredentialEmailParams = {
  to: string;
  guestName?: string | null;
  appName: string;
  appUsername: string;
  appPassword: string;
};

export async function sendCredentialEmail({
  to,
  guestName,
  appName,
  appUsername,
  appPassword,
}: SendCredentialEmailParams) {
  const salamNama = guestName ? `Yth. ${guestName},` : "Yth. Bapak/Ibu,";

  await transporter.sendMail({
    from: '"Tekpol PTPN" <no-reply@ptpn.co.id>',
    to,
    subject: `Akses Aplikasi ${appName}`,
    html: `
      <p>${salamNama}</p>
      <p>Permohonan akses aplikasi <strong>${appName}</strong> Anda telah <strong>disetujui</strong>.</p>
      <p>Berikut detail akun aplikasi:</p>
      <ul>
        <li>Username: <strong>${appUsername}</strong></li>
        <li>Password: <strong>${appPassword}</strong></li>
      </ul>
      <p>Silakan gunakan akun tersebut untuk login sesuai ketentuan yang berlaku.</p>
      <p>Terima kasih.</p>
    `,
  });
}
