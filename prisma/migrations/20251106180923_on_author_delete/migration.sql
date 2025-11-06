-- DropForeignKey
ALTER TABLE "public"."BlogPostComment" DROP CONSTRAINT "BlogPostComment_authorId_fkey";

-- AddForeignKey
ALTER TABLE "BlogPostComment" ADD CONSTRAINT "BlogPostComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
