'use server';

import { revalidatePath } from 'next/cache';
import { action } from '.';
import { prisma } from '../prisma';
import { blogPostCommentSchema, blogPostCommentUpvoteSchema, blogPostUpvoteSchema } from '../zod/blog-post-schema';

export const createBlogPostComment = action(blogPostCommentSchema, async ({ content, blogPostId, parentId }, session) => {
    try {
        const res = await prisma.blogPostComment.create({
            data: { content, blogPostId, userId: session.userId, parentId },
            select: { id: true, content: true, BlogPost: { select: { slug: true } } },
        });
        revalidatePath('/');
        revalidatePath('/blog');
        revalidatePath(`/blog/${res.BlogPost.slug}`);

        return { success: true, comment: res };
    } catch {
        return { success: false, message: 'Error - createBlogPostComment' };
    }
});

export const upvoteBlogPost = action(blogPostUpvoteSchema, async ({ blogPostId }, session) => {
    try {
        let upvote = await prisma.blogPostUpvote.findFirst({
            where: { blogPostId, userId: session.userId },
            select: { id: true, BlogPost: { select: { slug: true } } },
        });

        if (upvote) {
            await prisma.blogPostUpvote.delete({
                where: { id: upvote.id },
            });
        } else {
            upvote = await prisma.blogPostUpvote.create({
                data: { blogPostId, userId: session.userId },
                select: { id: true, BlogPost: { select: { slug: true } } },
            });
        }

        revalidatePath('/');
        revalidatePath('/blog');
        revalidatePath(`/blog/${upvote.BlogPost.slug}`);

        return { success: true };
    } catch {
        return { success: false, message: 'Error - upvoteBlogPost' };
    }
});

export const upvoteBlogPostComment = action(blogPostCommentUpvoteSchema, async ({ commentId }, session) => {
    try {
        const upvote = await prisma.blogPostCommentUpvote.findFirst({
            where: { blogPostCommentId: commentId, userId: session.userId },
        });

        if (upvote) {
            await prisma.blogPostCommentUpvote.delete({
                where: { id: upvote.id },
            });
        } else {
            await prisma.blogPostCommentUpvote.create({
                data: { blogPostCommentId: commentId, userId: session.userId },
            });
        }

        return { success: true };
    } catch {
        return { success: false, message: 'Error - upvoteBlogPostComment' };
    }
});
