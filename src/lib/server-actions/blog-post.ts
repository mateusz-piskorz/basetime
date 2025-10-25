'use server';

import { revalidatePath } from 'next/cache';
import { action } from '.';
import { prisma } from '../prisma';
import { blogPostCommentSchema, blogPostCommentUpvoteSchema, blogPostUpvoteSchema } from '../zod/blog-post-schema';

export const createBlogPostComment = action(blogPostCommentSchema, async ({ content, postId, parentId }, session) => {
    try {
        const res = await prisma.blogPostComment.create({
            data: { content, postId, userId: session.userId, parentId },
            select: { id: true, content: true, Post: { select: { slug: true } } },
        });
        revalidatePath('/');
        revalidatePath('/blog');
        revalidatePath(`/blog/${res.Post.slug}`);

        return { success: true, comment: res };
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

        if (upvote) {
            await prisma.blogPostCommentUpvote.delete({
                where: { userId_commentId: { commentId, userId } },
            });
        } else {
            await prisma.blogPostCommentUpvote.create({
                data: { commentId, userId },
            });
        }

        return { success: true };
    } catch {
        return { success: false, message: 'Error - upvoteBlogPostComment' };
    }
});
