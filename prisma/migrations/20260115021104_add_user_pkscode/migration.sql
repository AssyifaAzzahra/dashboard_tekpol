/*
  Warnings:

  - A unique constraint covering the columns `[pksCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PksDocumentSubmission_pksCode_createdAt_idx";

-- DropIndex
DROP INDEX "PksDocumentSubmission_status_createdAt_idx";

-- DropIndex
DROP INDEX "PksDocumentSubmission_uploaderId_createdAt_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "pksCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_pksCode_key" ON "User"("pksCode");
