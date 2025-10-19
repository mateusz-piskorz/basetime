'use server';

import { revalidatePath } from 'next/cache';
import { action } from '.';
import { initialBlogArticles } from '../constants/blog-initial-articles';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { createBlogPostSchema, removeBlogPostSchema, updateBlogPostSchema } from '../zod/blog-post-schema';

export const createBlogPost = action(createBlogPostSchema, async ({ slug }, session) => {
    try {
        console.log(session);
        if (session.role !== 'ADMIN') return { success: false, message: 'Error permission invalid' };

        const res = await prisma.blogPost.create({ data: { content: '', slug, title: slug, tags: [] } });
        revalidatePath('/blog');
        revalidatePath(`/blog/${slug}`);

        return { success: true, post: res };
    } catch (e) {
        console.log(e);
        return { success: false, message: 'Error - createBlogPost' };
    }
});

export const updateBlogPost = action(
    updateBlogPostSchema,
    async ({ id, content, slug, oldSlug, status, title, ogImageUrl, readTime, tags, description }, { role }) => {
        try {
            if (role !== 'ADMIN') return { success: false, message: 'Error permission invalid' };

            const res = await prisma.blogPost.update({
                where: { id },
                data: { description, content, slug, status, title, ogImageUrl, readTime, tags },
            });
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

export const seedBlogPost = async () => {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }
        if (session.role !== 'ADMIN') return { success: false, message: 'Error permission invalid' };

        await prisma.blogPost.createMany({
            data: initialBlogArticles.map(({ description, ogImageUrl, tags, readTime, slug, title, content }) => ({
                slug,
                content,
                title,
                description,
                readTime,
                ogImageUrl,
                tags,
            })),
        });

        revalidatePath('/blog');
        for (const article of initialBlogArticles) {
            revalidatePath(`/blog/${article.slug}`);
        }

        return { success: true };
    } catch {
        return { success: false, message: 'Error - seedBlogPost' };
    }
};
