import { prisma } from '@/lib/prisma';

export const deleteCommentParentRecursively = async (commentId: string) => {
    const comment = await prisma.blogPostComment.findUnique({
        where: { id: commentId, deleted: true },
        include: {
            Replies: true,
            Parent: true,
        },
    });

    if (!comment) return;

    if (comment.Replies.length <= 0) {
        const parentId = comment.parentId;
        await prisma.blogPostComment.delete({
            where: { id: commentId },
        });

        if (parentId) {
            await deleteCommentParentRecursively(parentId);
        }
    }
};
