import { prisma } from '@/lib/prisma';
import z from 'zod';
import { publicProcedure } from '../init';

export const blogPostComments = publicProcedure
    .input(z.object({ blogPostId: z.string(), page: z.number().nullish(), limit: z.number().nullish(), parentId: z.string().nullable() }))
    .query(async ({ input: { blogPostId, limit: limitInput, page: pageInput, parentId } }) => {
        const limit = Number(limitInput) || undefined;
        const page = Number(pageInput) || 1;
        const skip = limit ? (page - 1) * limit : undefined;

        const total = await prisma.blogPostComment.count({
            where: { blogPostId },
        });

        const data = await prisma.blogPostComment.findMany({
            where: { blogPostId, parentId },
            include: { _count: true, User: { select: { name: true, avatarId: true } } },
            take: limit,
            skip,
        });

        const totalPages = limit ? Math.ceil(total / limit) : 1;
        return { totalPages, total, page, limit, data };
    });
