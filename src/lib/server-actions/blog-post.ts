'use server';

import { revalidatePath } from 'next/cache';
import { action } from '.';
import { prisma } from '../prisma';
import { blogPostCommentSchema } from '../zod/blog-post-schema';

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
