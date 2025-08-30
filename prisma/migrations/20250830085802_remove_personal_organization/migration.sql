/*
  Warnings:

  - You are about to drop the column `personalOrganizationId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_personalOrganizationId_fkey";

-- DropIndex
DROP INDEX "public"."User_personalOrganizationId_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "personalOrganizationId";
