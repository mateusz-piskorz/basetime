/*
  Warnings:

  - You are about to drop the column `blogPostId` on the `BlogPostComment` table. All the data in the column will be lost.
  - Added the required column `postId` to the `BlogPostComment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."BlogPostComment" DROP CONSTRAINT "BlogPostComment_blogPostId_fkey";

-- AlterTable
ALTER TABLE "BlogPostComment" DROP COLUMN "blogPostId",
ADD COLUMN     "postId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "BlogPostComment" ADD CONSTRAINT "BlogPostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
