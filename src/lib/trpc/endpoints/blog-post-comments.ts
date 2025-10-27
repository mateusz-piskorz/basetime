import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
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
        const session = await getSession();

        const limit = Number(limitInput) ?? 50;
        const page = Number(cursor) || 1;
        const skip = limit ? (page - 1) * limit : undefined;

        const total = await prisma.blogPostComment.count({
            where: { postId, parentId },
        });

        const data = (
            await prisma.blogPostComment.findMany({
                where: { postId, parentId },
                include: {
                    _count: true,
                    Author: { select: { name: true, avatarId: true, id: true } },
                    Upvotes: { where: { userId: session?.userId } },
                },
                take: limit,
                skip,
                orderBy:
                    sorting === 'latest'
                        ? [{ updatedAt: 'desc' }, { id: 'desc' }]
                        : sorting === 'oldest'
                          ? [{ updatedAt: 'asc' }, { id: 'asc' }]
                          : [{ Upvotes: { _count: 'desc' } }, { Replies: { _count: 'desc' } }, { id: 'desc' }],
            })
        ).map((comment) => {
            const { id, ...author } = comment.Author;
            return { ...comment, upvotedByUser: Boolean(comment.Upvotes.length), isOwner: comment.Author.id === session?.userId, Author: author };
        });

        const totalPages = limit ? Math.ceil(total / limit) : 1;
        const hasMore = page < totalPages;

        return { totalPages, total, page, limit, data, hasMore };
    });
