'use server';

import { revalidatePath } from 'next/cache';
import { action } from '.';
import { prisma } from '../prisma';
import { getSession } from '../session';
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

const articlesArr = [
    {
        slug: 'post-1',
        tags: ['UI/UX', 'Inspiration', 'Graphic Design'],
        readTime: '9min read',
        title: 'Maximize Productivity: How a Time Tracker App Transforms Your Workday',
        description: 'Learn about the unexpected advantages of time tracking, from better work-life balance to improved project estimates.',
        content: '',
        ogImageUrl: '/blog/porsche-1.jpeg',
    },
    {
        slug: 'post-2',
        tags: ['UI/UX', 'Inspiration', 'Graphic Design'],
        readTime: '9min read',
        title: 'Maximize Productivity: How a Time Tracker App Transforms Your Workday',
        description: 'Learn about the unexpected advantages of time tracking, from better work-life balance to improved project estimates.',
        content: '',
        ogImageUrl: '/blog/porsche-2.jpeg',
    },
    {
        slug: 'post-3',
        tags: ['UI/UX', 'Inspiration', 'Graphic Design'],
        readTime: '9min read',
        title: 'Maximize Productivity: How a Time Tracker App Transforms Your Workday',
        description: 'Learn about the unexpected advantages of time tracking, from better work-life balance to improved project estimates.',
        content: '',
        ogImageUrl: '/blog/porsche-3.jpeg',
    },
];

export const seedBlogPost = async () => {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }
        if (session.role !== 'ADMIN') return { success: false, message: 'Error permission invalid' };

        await prisma.blogPost.createMany({
            data: articlesArr.map(({ description, ogImageUrl, tags, readTime, slug, title, content }) => ({
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
        for (const article of articlesArr) {
            revalidatePath(`/blog/${article.slug}`);
        }

        return { success: true };
    } catch (e) {
        console.log(e);
        return { success: false, message: 'Error - seedBlogPost' };
    }
};
