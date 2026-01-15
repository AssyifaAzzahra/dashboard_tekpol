// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { GALLERY_ITEMS } from "../lib/data/gallery"; // sesuaikan kalau path beda

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

/**
 * bikin slug unik di tabel GalleryCategory (kalau sudah ada -> tambah -2, -3, dst)
 */
async function uniqueCategorySlug(baseName: string) {
  const base = slugify(baseName) || "umum";
  let slug = base;
  let i = 2;

  // cek existing slug
  while (true) {
    const exists = await prisma.galleryCategory.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${base}-${i}`;
    i += 1;
  }
}

const DEFAULT_PKS_PASSWORD = "Tekpol@123";

const PKS_USERS = [
  { email: "tpu@tekpol.co.id", name: "PKS TPU - Tanah Putih", pksCode: "TPU" },
  { email: "tme@tekpol.co.id", name: "PKS TME - Tanjung Medan", pksCode: "TME" },
  { email: "sgh@tekpol.co.id", name: "PKS SGH - Sei Galuh", pksCode: "SGH" },
  { email: "spa@tekpol.co.id", name: "PKS SPA - Sei Pagar", pksCode: "SPA" },
  { email: "sgo@tekpol.co.id", name: "PKS SGO - Sei Garo", pksCode: "SGO" },
  { email: "sbt@tekpol.co.id", name: "PKS SBT - Sei Buatan", pksCode: "SBT" },
  { email: "lda@tekpol.co.id", name: "PKS LDA - Lubuk Dalam", pksCode: "LDA" },
  { email: "tan@tekpol.co.id", name: "PKS TAN - Tandun", pksCode: "TAN" },
  { email: "ter@tekpol.co.id", name: "PKS TER - Terantam", pksCode: "TER" },
  { email: "sta@tekpol.co.id", name: "PKS STA - Sei Tapung", pksCode: "STA" },
  { email: "sro@tekpol.co.id", name: "PKS SRO - Sei Rokan", pksCode: "SRO" },
  { email: "sin@tekpol.co.id", name: "PKS SIN - Sei Intan", pksCode: "SIN" },
];

async function seedUsers() {
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

  // --- Kabag/Kasubag dummy testing ---
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

  // --- 12 akun PKS (ini yang bikin menu Upload Dokumen muncul) ---
  const pksHash = await bcrypt.hash(DEFAULT_PKS_PASSWORD, 10);

  for (const u of PKS_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        passwordHash: pksHash,
        role: "KARYAWAN", // boleh tetap KARYAWAN, kunci utamanya pksCode
        isPic: false,
        pksCode: u.pksCode,
      },
      create: {
        name: u.name,
        email: u.email,
        passwordHash: pksHash,
        role: "KARYAWAN",
        isPic: false,
        pksCode: u.pksCode,
      },
    });
  }

  console.log("✅ Seed users selesai.");
  console.log("✅ 12 akun PKS dibuat. Password:", DEFAULT_PKS_PASSWORD);
}

async function seedAppsMinimal() {
  // Boleh kamu comment kalau ga mau dummy app
  const minimalApps = [
    {
      name: "Contoh App",
      category: "HO" as const,
      url: "https://example.com",
      username: null,
      password: null,
      description: "Contoh (hapus/ganti lewat Admin)",
    },
  ] as const;

  for (const a of minimalApps) {
    await prisma.app.upsert({
      where: { name: a.name },
      update: {
        category: a.category,
        url: a.url,
        username: a.username,
        password: a.password,
        description: a.description,
      },
      create: {
        name: a.name,
        category: a.category,
        url: a.url,
        username: a.username,
        password: a.password,
        description: a.description,
      },
    });
  }

  console.log("✅ Seed apps minimal selesai.");
}

async function seedGalleryFromLegacyItems() {
  // ambil kategori unik dari GALLERY_ITEMS (fallback Umum)
  const cats = Array.from(
    new Set(
      (GALLERY_ITEMS || []).map((x: any) => {
        const raw = (x?.category ?? x?.group ?? x?.tag ?? "Umum") as string;
        const name = (raw || "").trim();
        return name || "Umum";
      })
    )
  );

  // upsert kategori → slug unik
  let order = 1;
  for (const name of cats) {
    const existsByName = await prisma.galleryCategory.findFirst({
      where: { name },
      select: { id: true, slug: true },
    });

    if (existsByName) {
      await prisma.galleryCategory.update({
        where: { id: existsByName.id },
        data: { isActive: true, order },
      });
    } else {
      const slug = await uniqueCategorySlug(name);
      await prisma.galleryCategory.create({
        data: { name, slug, isActive: true, order },
      });
    }

    order += 1;
  }

  // upsert item gallery ke Gallery (pakai id lama biar tidak dobel)
  for (const it of GALLERY_ITEMS || []) {
    const rawCat = (it as any)?.category ?? (it as any)?.group ?? (it as any)?.tag ?? "Umum";
    const catName = ((rawCat as string) || "").trim() || "Umum";

    const title = (it.title || "").trim() || null;
    const caption = (it.caption || "").trim() || null;
    const imageUrl = (it.image || "").trim();

    // skip kalau image kosong (biar ga error)
    if (!imageUrl) continue;

    await prisma.gallery.upsert({
      where: { id: it.id },
      update: {
        title,
        caption,
        category: catName,
        imageUrl,
        isVisible: true,
        order: 0,
      },
      create: {
        id: it.id,
        title,
        caption,
        category: catName,
        imageUrl,
        isVisible: true,
        order: 0,
      },
    });
  }

  console.log(`✅ Seed gallery selesai: ${(GALLERY_ITEMS || []).length} item (yang tanpa image di-skip)`);
}

async function main() {
  await seedUsers();
  await seedAppsMinimal(); // kalau gak mau app dummy, comment baris ini
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
