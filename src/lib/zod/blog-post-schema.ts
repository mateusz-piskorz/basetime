import { BLOG_POST_STATUS } from '@prisma/client';
import z from 'zod';

export const createBlogPostSchema = z.object({
    slug: z.string(),
});

export const updateBlogPostSchema = z.object({
    id: z.string(),
    title: z.string().optional(),
    content: z.string().optional(),
    oldSlug: z.string().optional(),
    slug: z.string().optional(),
    ogImageUrl: z.string().nullish(),
    readTime: z.string().nullish(),
    tags: z.array(z.string()).optional(),
    status: z.nativeEnum(BLOG_POST_STATUS).optional(),
});

export const removeBlogPostSchema = z.object({ blogPostId: z.string() });
