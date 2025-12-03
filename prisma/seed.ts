import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // --- USERS ---
  await prisma.user.upsert({
    where: { email: "kabag@tekpol.local" },
    update: {},
    create: {
      name: "Kabag Tekpol",
      email: "kabag@tekpol.local",
      passwordHash: await bcrypt.hash("kabag123", 10),
      role: "KABAG", // ← pakai literal
    },
  });

  await prisma.user.upsert({
    where: { email: "kasubag@tekpol.local" },
    update: {},
    create: {
      name: "Kasubag Tekpol",
      email: "kasubag@tekpol.local",
      passwordHash: await bcrypt.hash("kasubag123", 10),
      role: "KASUBAG",
    },
  });

  await prisma.user.upsert({
    where: { email: "karyawan1@tekpol.local" },
    update: {},
    create: {
      name: "Karyawan 1",
      email: "karyawan1@tekpol.local",
      passwordHash: await bcrypt.hash("karyawan123", 10),
      role: "KARYAWAN",
      isPic: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "karyawan2@tekpol.local" },
    update: {},
    create: {
      name: "Karyawan 2",
      email: "karyawan2@tekpol.local",
      passwordHash: await bcrypt.hash("karyawan123", 10),
      role: "KARYAWAN",
      isPic: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "karyawan3@tekpol.local" },
    update: {},
    create: {
      name: "Karyawan 3",
      email: "karyawan3@tekpol.local",
      passwordHash: await bcrypt.hash("karyawan123", 10),
      role: "KARYAWAN",
      isPic: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "pkwt1@tekpol.local" },
    update: {},
    create: {
      name: "PKWT 1",
      email: "pkwt1@tekpol.local",
      passwordHash: await bcrypt.hash("pkwt123", 10),
      role: "PKWT",
    },
  });

  // --- APPS ---
  const apps = [
    { name: "SAP HO",              category: "HO" as const,       username: "sap_ho_user",  password: "Sap#2025",   description: "ERP HO" },
    { name: "E-Office HO",         category: "HO" as const,       username: "eoffice_ho",   password: "Office#2025",description: "Surat menyurat" },
    { name: "SIM Aset HO",         category: "HO" as const,       username: "sim_aset",     password: "Aset#2025",  description: "Aset perusahaan" },
    { name: "Dashboard Regional",  category: "REGIONAL" as const, username: "dash_reg",     password: "Dash#2025",  description: "Dashboard wilayah" },
    { name: "E-Plant Regional",    category: "REGIONAL" as const, username: "eplant_reg",   password: "Plant#2025", description: "Tanaman" },
    { name: "SIM Pupuk Regional",  category: "REGIONAL" as const, username: "simpupuk_reg", password: "Pupuk#2025", description: "Pupuk" },
  ] as const;

  for (const a of apps) {
    await prisma.app.upsert({ where: { name: a.name }, update: {}, create: a });
  }

  console.log("Seeding selesai.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
