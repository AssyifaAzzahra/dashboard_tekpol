// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { GALLERY_ITEMS } from "../lib/data/gallery"; // ⬅️ sesuaikan kalau lokasi berbeda

const prisma = new PrismaClient();

function slugify(input: string) {
  return (input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function seedUsersAndApps() {
  // --- SUPERADMIN ---
  const email = process.env.SUPERADMIN_EMAIL ?? "superadmin@tekpol.local";
  const password = process.env.SUPERADMIN_PASSWORD ?? "SuperAdmin123!";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email },
    update: {
      name: "Super Admin",
      role: "SUPERADMIN",
      passwordHash,
      isPic: false,
    },
    create: {
      name: "Super Admin",
      email,
      role: "SUPERADMIN",
      passwordHash,
      isPic: false,
    },
  });

  console.log("✅ Seed superadmin:", email);

  // --- USERS ---
  await prisma.user.upsert({
    where: { email: "kabag@tekpol.local" },
    update: {},
    create: {
      name: "Kabag Tekpol",
      email: "kabag@tekpol.local",
      passwordHash: await bcrypt.hash("kabag123", 10),
      role: "KABAG",
      isPic: false,
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
      isPic: false,
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
      isPic: false,
    },
  });

  // --- APPS ---
  const apps = [
    { name: "SAP HO", category: "HO" as const, username: "sap_ho_user", password: "Sap#2025", description: "ERP HO" },
    { name: "E-Office HO", category: "HO" as const, username: "eoffice_ho", password: "Office#2025", description: "Surat menyurat" },
    { name: "SIM Aset HO", category: "HO" as const, username: "sim_aset", password: "Aset#2025", description: "Aset perusahaan" },
    { name: "Dashboard Regional", category: "REGIONAL" as const, username: "dash_reg", password: "Dash#2025", description: "Dashboard wilayah" },
    { name: "E-Plant Regional", category: "REGIONAL" as const, username: "eplant_reg", password: "Plant#2025", description: "Tanaman" },
    { name: "SIM Pupuk Regional", category: "REGIONAL" as const, username: "simpupuk_reg", password: "Pupuk#2025", description: "Pupuk" },
  ] as const;

  for (const a of apps) {
    await prisma.app.upsert({
      where: { name: a.name },
      update: {},
      create: a,
    });
  }

  console.log("✅ Seed users + apps selesai.");
}

async function seedGalleryFromLegacyItems() {
  // kumpulkan kategori unik dari GALLERY_ITEMS
  const cats = Array.from(
    new Set(
      GALLERY_ITEMS.map((x) => (x.category || "Umum").trim() || "Umum")
    )
  );

  // upsert kategori ke GalleryCategory (order dibuat urut sesuai list)
  let order = 1;
  for (const name of cats) {
    const slug = slugify(name) || "umum";
    await prisma.galleryCategory.upsert({
      where: { slug },
      update: { name, isActive: true, order },
      create: { name, slug, isActive: true, order },
    });
    order += 1;
  }

  // upsert item gallery ke Gallery (pakai id lama biar tidak dobel)
  for (const it of GALLERY_ITEMS) {
    const catName = (it.category || "Umum").trim() || "Umum";
    const title = it.title?.trim() ? it.title.trim() : null;
    const caption = it.caption?.trim() ? it.caption.trim() : null;

    await prisma.gallery.upsert({
      where: { id: it.id },
      update: {
        title,
        caption,
        category: catName,
        imageUrl: it.image, // contoh "/images/galeri/senam1.jpg"
        isVisible: true,
        order: 0,
      },
      create: {
        id: it.id,
        title,
        caption,
        category: catName,
        imageUrl: it.image,
        isVisible: true,
        order: 0,
      },
    });
  }

  console.log(`✅ Seed gallery selesai: ${GALLERY_ITEMS.length} foto`);
}

async function main() {
  await seedUsersAndApps();
  await seedGalleryFromLegacyItems();
  console.log("✅ Seeding selesai semua.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
