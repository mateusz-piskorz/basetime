'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '../../prisma';
import { blogPostCommentDeleteSchema, blogPostCommentSchema, blogPostCommentUpvoteSchema, blogPostUpvoteSchema } from '../../zod/blog-post-schema';
import { action } from '../_utils';
import { deleteCommentParentRecursively } from './_delete-comment-parent-recursively';

export const createBlogPostComment = action(blogPostCommentSchema, async ({ content, postId, parentId }, session) => {
    try {
        if (parentId) {
            const parentComment = await prisma.blogPostComment.findUnique({ where: { id: parentId, deleted: null } });
            if (!parentComment) {
                return { success: false, message: "Error - can't add reply to deleted comment" };
            }
        }

        const res = await prisma.blogPostComment.create({
            data: { content, postId, authorId: session.userId, parentId },
            include: {
                _count: true,
                Author: { select: { name: true, avatarId: true } },
                Upvotes: { where: { userId: session?.userId } },
                Post: { select: { slug: true } },
            },
        });
        revalidatePath('/');
        revalidatePath('/blog');
        revalidatePath(`/blog/${res.Post.slug}`);

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error - createBlogPostComment' };
    }
});

export const upvoteBlogPost = action(blogPostUpvoteSchema, async ({ postId }, { userId }) => {
    try {
        let upvote = await prisma.blogPostUpvote.findFirst({
            where: { postId, userId },
            select: { Post: { select: { slug: true } } },
        });

        if (upvote) {
            await prisma.blogPostUpvote.delete({
                where: { userId_postId: { postId, userId } },
            });
        } else {
            upvote = await prisma.blogPostUpvote.create({
                data: { postId, userId },
                select: { Post: { select: { slug: true } } },
            });
        }

        revalidatePath('/');
        revalidatePath('/blog');
        revalidatePath(`/blog/${upvote.Post.slug}`);

        return { success: true };
    } catch {
        return { success: false, message: 'Error - upvoteBlogPost' };
    }
});

export const upvoteBlogPostComment = action(blogPostCommentUpvoteSchema, async ({ commentId }, { userId }) => {
    try {
        const upvote = await prisma.blogPostCommentUpvote.findFirst({
            where: { commentId, userId },
        });

        let upvoteType: 'removed' | 'added' = 'added';
        if (upvote) {
            upvoteType = 'removed' as const;
            await prisma.blogPostCommentUpvote.delete({
                where: { userId_commentId: { commentId, userId } },
            });
        } else {
            await prisma.blogPostCommentUpvote.create({
                data: { commentId, userId },
            });
        }

        return { success: true, upvoteType };
    } catch {
        return { success: false, message: 'Error - upvoteBlogPostComment' };
    }
});

export const deleteBlogPostComment = action(blogPostCommentDeleteSchema, async ({ commentId }, { userId }) => {
    try {
        const comment = await prisma.blogPostComment.findUnique({
            where: { id: commentId, Author: { id: userId } },
            include: {
                Replies: true,
                Parent: true,
                Post: { select: { slug: true } },
            },
        });

        if (!comment) return { success: false, message: 'Error - deleteBlogPostComment' };

        if (comment.Replies.length <= 0) {
            await prisma.blogPostComment.delete({ where: { id: commentId } });
            if (comment.parentId) await deleteCommentParentRecursively(comment.parentId);

            revalidatePath('/');
            revalidatePath('/blog');
            revalidatePath(`/blog/${comment?.Post.slug}`);
        } else {
            await prisma.blogPostComment.update({ where: { id: commentId }, data: { deleted: true } });
        }

        return { success: true };
    } catch {
        return { success: false, message: 'Error - deleteBlogPostComment' };
    }
});
