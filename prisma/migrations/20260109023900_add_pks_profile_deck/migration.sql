-- CreateTable
CREATE TABLE "PksProfileDeck" (
    "id" TEXT NOT NULL,
    "pksId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PksProfileDeck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PksProfileDeck_pksId_key" ON "PksProfileDeck"("pksId");

-- CreateIndex
CREATE INDEX "News_sourceType_idx" ON "News"("sourceType");
