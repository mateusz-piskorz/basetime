-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarId" TEXT;

-- CreateTable
CREATE TABLE "BlogPostUpvote" (
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "BlogPostUpvote_pkey" PRIMARY KEY ("userId","postId")
);

-- CreateTable
CREATE TABLE "BlogPostComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "deleted" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "BlogPostComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostCommentUpvote" (
    "userId" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,

    CONSTRAINT "BlogPostCommentUpvote_pkey" PRIMARY KEY ("userId","commentId")
);

-- AddForeignKey
ALTER TABLE "BlogPostUpvote" ADD CONSTRAINT "BlogPostUpvote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostUpvote" ADD CONSTRAINT "BlogPostUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostComment" ADD CONSTRAINT "BlogPostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostComment" ADD CONSTRAINT "BlogPostComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostComment" ADD CONSTRAINT "BlogPostComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "BlogPostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostCommentUpvote" ADD CONSTRAINT "BlogPostCommentUpvote_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "BlogPostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPostCommentUpvote" ADD CONSTRAINT "BlogPostCommentUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
