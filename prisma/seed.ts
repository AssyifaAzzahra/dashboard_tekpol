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

  console.log("✅ Seed superadmin:", email);

  // --- USERS (opsional buat testing) ---
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

  console.log("✅ Seed users selesai.");
}

async function seedAppsMinimal() {
  // Karena App.url WAJIB, kalau kamu tidak mau seed apps,
  // kamu bisa BIARKAN KOSONG (tidak create apa-apa).
  // Tapi ini contoh minimal 1 app dummy supaya UI tidak kosong total.
  //
  // Admin nanti bisa create apps yang asli dari halaman Admin.

  const minimalApps = [
    {
      name: "Contoh App",
      category: "HO" as const,
      url: "https://example.com", // wajib, bisa diganti nanti oleh Admin
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
  // kumpulkan kategori unik dari GALLERY_ITEMS
  const cats = Array.from(
    new Set(GALLERY_ITEMS.map((x) => (x.category || "Umum").trim() || "Umum"))
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
        imageUrl: it.image,
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
  await seedUsers();
  await seedAppsMinimal(); // kalau gak mau ada app dummy sama sekali, comment baris ini
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
