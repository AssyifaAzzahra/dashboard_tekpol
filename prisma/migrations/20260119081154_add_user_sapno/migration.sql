/*
  Warnings:

  - A unique constraint covering the columns `[sapNo]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sapNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_sapNo_key" ON "User"("sapNo");
