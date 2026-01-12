-- DropIndex
DROP INDEX "News_sourceType_idx";

-- AlterTable
ALTER TABLE "App" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Pks" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortProfile" TEXT,
    "address" TEXT,
    "capacity" TEXT,
    "yearOperation" INTEGER,
    "lineCount" INTEGER,
    "operationalNotes" TEXT,
    "photoUrl" TEXT,
    "structureUrl" TEXT,
    "certificateUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ppis" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortProfile" TEXT,
    "address" TEXT,
    "capacity" TEXT,
    "yearOperation" INTEGER,
    "lineCount" INTEGER,
    "operationalNotes" TEXT,
    "photoUrl" TEXT,
    "structureUrl" TEXT,
    "certificateUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ppis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ppkr" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortProfile" TEXT,
    "address" TEXT,
    "capacity" TEXT,
    "yearOperation" INTEGER,
    "lineCount" INTEGER,
    "operationalNotes" TEXT,
    "photoUrl" TEXT,
    "structureUrl" TEXT,
    "certificateUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ppkr_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pks_name_key" ON "Pks"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Pks_slug_key" ON "Pks"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ppis_slug_key" ON "Ppis"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ppkr_slug_key" ON "Ppkr"("slug");

-- CreateIndex
CREATE INDEX "App_category_name_idx" ON "App"("category", "name");
