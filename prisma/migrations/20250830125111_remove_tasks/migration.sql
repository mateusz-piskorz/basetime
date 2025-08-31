/*
  Warnings:

  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MemberToTask` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Task" DROP CONSTRAINT "Task_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TimeEntry" DROP CONSTRAINT "TimeEntry_taskId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MemberToTask" DROP CONSTRAINT "_MemberToTask_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MemberToTask" DROP CONSTRAINT "_MemberToTask_B_fkey";

-- DropTable
DROP TABLE "public"."Task";

-- DropTable
DROP TABLE "public"."_MemberToTask";
