-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarId" TEXT;

-- CreateTable
CREATE TABLE "BlogPostUpvote" (
    "id" TEXT NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BlogPostUpvote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "blogPostId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "BlogPostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostCommentUpvote" (
    "id" TEXT NOT NULL,
    "blogPostCommentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BlogPostCommentUpvote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BlogPostUpvote" ADD CONSTRAINT "BlogPostUpvote_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostUpvote" ADD CONSTRAINT "BlogPostUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostComment" ADD CONSTRAINT "BlogPostComment_blogPostId_fkey" FOREIGN KEY ("blogPostId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostComment" ADD CONSTRAINT "BlogPostComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostComment" ADD CONSTRAINT "BlogPostComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BlogPostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostCommentUpvote" ADD CONSTRAINT "BlogPostCommentUpvote_blogPostCommentId_fkey" FOREIGN KEY ("blogPostCommentId") REFERENCES "BlogPostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostCommentUpvote" ADD CONSTRAINT "BlogPostCommentUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
