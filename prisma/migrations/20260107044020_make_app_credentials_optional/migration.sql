-- Make username & password optional (nullable)
ALTER TABLE "App"
  ALTER COLUMN "username" DROP NOT NULL,
  ALTER COLUMN "password" DROP NOT NULL;
