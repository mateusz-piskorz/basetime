/*
  Warnings:

  - You are about to drop the column `taskId` on the `TimeEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."TimeEntry" DROP COLUMN "taskId";
