'use server';

import { revalidatePath } from 'next/cache';
import { action } from '.';
import { prisma } from '../prisma';
import { createBlogPostSchema, removeBlogPostSchema, updateBlogPostSchema } from '../zod/blog-post-schema';

export const createBlogPost = action(createBlogPostSchema, async ({ slug }, { role }) => {
    try {
        if (role !== 'ADMIN') return { success: false, message: 'Error permission invalid' };

        const res = await prisma.blogPost.create({ data: { content: '', slug, title: slug, tags: [] } });
        revalidatePath('/blog');
        revalidatePath(`/blog/${slug}`);

        return { success: true, post: res };
    } catch {
        return { success: false, message: 'Error - createBlogPost' };
    }
});

export const updateBlogPost = action(
    updateBlogPostSchema,
    async ({ id, content, slug, oldSlug, status, title, ogImageUrl, readTime, tags }, { role }) => {
        try {
            if (role !== 'ADMIN') return { success: false, message: 'Error permission invalid' };

            const res = await prisma.blogPost.update({ where: { id }, data: { content, slug, status, title, ogImageUrl, readTime, tags } });
            if (oldSlug) revalidatePath(`/blog/${oldSlug}`);
            revalidatePath('/blog');
            revalidatePath(`/blog/${res.slug}`);

            return { success: true, post: res };
        } catch {
            return { success: false, message: 'Error - updateBlogPost' };
        }
    },
);

export const removeBlogPost = action(removeBlogPostSchema, async ({ blogPostId }, { role }) => {
    try {
        if (role !== 'ADMIN') return { success: false, message: 'Error permission invalid' };

        const res = await prisma.blogPost.delete({ where: { id: blogPostId } });
        revalidatePath('/blog');
        revalidatePath(`/blog/${res.slug}`);

        return { success: true };
    } catch {
        return { success: false, message: 'Error - removeBlogPost' };
    }
});
