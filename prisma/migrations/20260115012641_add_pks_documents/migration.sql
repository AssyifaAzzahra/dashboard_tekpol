-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "PksDocumentSubmission" (
    "id" TEXT NOT NULL,
    "pksCode" TEXT NOT NULL,
    "pksName" TEXT,
    "fileUrl" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT,
    "sizeBytes" INTEGER NOT NULL,
    "status" "DocStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "uploaderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PksDocumentSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PksDocumentSubmission_pksCode_createdAt_idx" ON "PksDocumentSubmission"("pksCode", "createdAt");

-- CreateIndex
CREATE INDEX "PksDocumentSubmission_status_createdAt_idx" ON "PksDocumentSubmission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PksDocumentSubmission_uploaderId_createdAt_idx" ON "PksDocumentSubmission"("uploaderId", "createdAt");

-- AddForeignKey
ALTER TABLE "PksDocumentSubmission" ADD CONSTRAINT "PksDocumentSubmission_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
