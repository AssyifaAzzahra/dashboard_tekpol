ALTER TABLE "PksProfileDeck" ADD COLUMN IF NOT EXISTS "coverUrl" TEXT;
ALTER TABLE "PksProfileDeck" ADD COLUMN IF NOT EXISTS "fileType" TEXT;

UPDATE "PksProfileDeck"
SET "fileType" = CASE
  WHEN lower(coalesce("fileName", '')) LIKE '%.pdf'
    OR lower(coalesce("fileUrl", '')) LIKE '%.pdf' THEN 'pdf'
  WHEN lower(coalesce("fileName", '')) LIKE '%.pptx'
    OR lower(coalesce("fileUrl", '')) LIKE '%.pptx' THEN 'pptx'
  WHEN lower(coalesce("fileName", '')) LIKE '%.ppt'
    OR lower(coalesce("fileUrl", '')) LIKE '%.ppt' THEN 'ppt'
  ELSE 'pdf'
END
WHERE "fileType" IS NULL;

ALTER TABLE "PksProfileDeck" ALTER COLUMN "fileType" SET NOT NULL;
