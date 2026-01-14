/*
  Warnings:

  - Made the column `username` on table `App` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `App` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "App" ADD COLUMN     "logoUrl" TEXT,
ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL,
ALTER COLUMN "url" DROP NOT NULL;
