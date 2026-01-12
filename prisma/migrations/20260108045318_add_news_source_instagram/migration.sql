-- 0) ENUM NewsSource (buat kalau belum ada)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'NewsSource') THEN
    CREATE TYPE "NewsSource" AS ENUM ('INTERNAL', 'INSTAGRAM');
  END IF;
END $$;

-- 1) FIX kolom App: createdAt + updatedAt aman untuk table yang sudah berisi data
ALTER TABLE "App"
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Kalau sebelumnya sudah terlanjur ada updatedAt tapi NULL, amanin datanya
UPDATE "App" SET "updatedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP);

-- Pastikan default tetap ada (biar insert berikutnya aman)
ALTER TABLE "App" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- 2) URL App: jangan langsung SET NOT NULL kalau ada data lama NULL
-- Isi dulu yang NULL, baru boleh set NOT NULL
UPDATE "App" SET "url" = '' WHERE "url" IS NULL;

ALTER TABLE "App" ALTER COLUMN "url" SET NOT NULL;

-- 3) Tambah kolom News untuk Instagram
ALTER TABLE "News"
  ADD COLUMN IF NOT EXISTS "instagramUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "sourceType" "NewsSource" NOT NULL DEFAULT 'INTERNAL';

-- 4) Index untuk News.sourceType (buat kalau belum ada)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'News_sourceType_idx'
      AND n.nspname = 'public'
  ) THEN
    CREATE INDEX "News_sourceType_idx" ON "News"("sourceType");
  END IF;
END $$;
