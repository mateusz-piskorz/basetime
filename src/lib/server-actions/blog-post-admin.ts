'use server';

import { createId } from '@paralleldrive/cuid2';
import { revalidatePath } from 'next/cache';
import z from 'zod';
import { initialBlogArticles } from '../constants/blog-initial-articles';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { generateRandomSentence, getAppEnv } from '../utils/common';
import { createBlogPostSchema, removeBlogPostSchema, seedBlogPostCommentsSchema, updateBlogPostSchema } from '../zod/blog-post-admin-schema';
import { action } from './_utils';

export const revalidateBlogPosts = action(z.object({}), async ({}, session) => {
    try {
        if (session.role !== 'ADMIN') return { success: false, message: 'Error permission invalid' };

        revalidatePath('/');
        revalidatePath('/blog');
        revalidatePath('/(main)/blog/[slug]', 'page');

        return { success: true };
    } catch {
        return { success: false, message: 'Error - revalidateBlogPosts' };
    }
});

export const createBlogPost = action(createBlogPostSchema, async ({ slug }, session) => {
    try {
        if (session.role !== 'ADMIN') return { success: false, message: 'Error permission invalid' };

        const res = await prisma.blogPost.create({ data: { content: '', slug, title: slug, tags: [] } });
        revalidatePath('/');
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
            revalidatePath('/');
            if (oldSlug) revalidatePath(`/blog/${oldSlug}`);
            revalidatePath('/blog');
            revalidatePath(`/blog/${res.slug}`);

            return { success: true, post: res };
        } catch {
            return { success: false, message: 'Error - updateBlogPost' };
        }
    },
);

export const removeBlogPost = action(removeBlogPostSchema, async ({ postId }, { role }) => {
    try {
        if (role !== 'ADMIN') return { success: false, message: 'Error permission invalid' };

        const res = await prisma.blogPost.delete({ where: { id: postId } });
        revalidatePath('/');
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

        revalidatePath('/');
        revalidatePath('/blog');
        for (const article of initialBlogArticles) {
            revalidatePath(`/blog/${article.slug}`);
        }

        return { success: true };
    } catch {
        return { success: false, message: 'Error - seedBlogPost' };
    }
};

export const seedBlogPostComments = action(seedBlogPostCommentsSchema, async ({ postId }, { role }) => {
    try {
        if (getAppEnv() === 'production') return { success: false, message: `Can't be used in production` };
        if (role !== 'ADMIN') return { success: false, message: 'Error permission invalid' };

        let blogPost;
        for (let i = 0; i < 20; i++) {
            try {
                blogPost = await prisma.blogPost.findUnique({ where: { id: postId } });
                const count = await prisma.blogPostComment.count();

                const email = `${createId()}@onet.pl`;
                const name = `${createId()}-name`;
                const password = `${createId()}-password`;

                await prisma.user.create({
                    data: {
                        email,
                        name,
                        password,
                        BlogPostComments: {
                            createMany: {
                                data: await Promise.all(
                                    Array.from({ length: 5 }, (_, index) => index).map(async (e) => {
                                        const parentPost = await prisma.blogPostComment.findMany({
                                            take: 1,
                                            skip: Math.floor(Math.random() * count),
                                        });
                                        const parentId = parentPost.length > 0 ? (Boolean(Math.random() > 0.5) ? parentPost[0].id : null) : null;
                                        return { postId, content: generateRandomSentence(Boolean(Math.random() > 0.5) ? 4 : 25), parentId };
                                    }),
                                ),
                            },
                        },
                    },
                });
            } catch (e) {
                console.log(e);
            }
        }

        revalidatePath('/');
        revalidatePath('/blog');
        revalidatePath(`/blog/${blogPost?.slug}`);

        return { success: true };
    } catch {
        return { success: false, message: 'Error - seedBlogPostComments' };
    }
});
