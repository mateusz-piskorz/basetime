-- CreateEnum
CREATE TYPE "public"."PROJECT_COLOR" AS ENUM ('GRAY', 'BLUE', 'ORANGE');

-- Add column as nullable first
ALTER TABLE "public"."Project" ADD COLUMN "color" "public"."PROJECT_COLOR";

-- Set existing rows to 'GRAY'
UPDATE "public"."Project" SET "color" = 'GRAY' WHERE "color" IS NULL;

-- Alter column to NOT NULL
ALTER TABLE "public"."Project" ALTER COLUMN "color" SET NOT NULL;
