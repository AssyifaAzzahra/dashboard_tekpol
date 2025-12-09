/*
  Warnings:

  - A unique constraint covering the columns `[trackingCode]` on the table `Request` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "guestName" TEXT,
ADD COLUMN     "trackingCode" TEXT,
ADD COLUMN     "trackingPin" TEXT,
ALTER COLUMN "requesterId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Request_trackingCode_key" ON "Request"("trackingCode");
