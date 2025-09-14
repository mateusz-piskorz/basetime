-- CreateEnum
CREATE TYPE "public"."WEEK_START" AS ENUM ('MONDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "public"."Organization" ADD COLUMN     "roundUpMinutesThreshold" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "weekStart" "public"."WEEK_START" NOT NULL DEFAULT 'MONDAY';
