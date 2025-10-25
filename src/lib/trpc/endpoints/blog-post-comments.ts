import { prisma } from '@/lib/prisma';
import z from 'zod';
import { publicProcedure } from '../init';

export const blogPostComments = publicProcedure
    .input(
        z.object({
            cursor: z.number().nullish(), // we can treat is as a page in standard pagination
            limit: z.number().nullish(),
            postId: z.string(),
            parentId: z.string().nullable(),
            sorting: z.union([z.literal('featured'), z.literal('latest'), z.literal('oldest')]),
        }),
    )
    .query(async ({ input: { postId, limit: limitInput, parentId, sorting, cursor } }) => {
        console.log(cursor);
        const limit = Number(limitInput) ?? 50;
        const page = Number(cursor) || 1;
        const skip = limit ? (page - 1) * limit : undefined;

        const total = await prisma.blogPostComment.count({
            where: { postId, parentId },
        });

        const data = await prisma.blogPostComment.findMany({
            where: { postId, parentId },
            include: { _count: true, Author: { select: { name: true, avatarId: true } } },
            take: limit,
            skip,
            orderBy: sorting === 'latest' ? { updatedAt: 'desc' } : sorting === 'oldest' ? { updatedAt: 'asc' } : { Upvotes: { _count: 'desc' } },
        });

        const totalPages = limit ? Math.ceil(total / limit) : 1;
        const hasMore = page < totalPages;
        return { totalPages, total, page, limit, data, hasMore };
    });
