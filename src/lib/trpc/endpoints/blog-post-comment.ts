import { prisma } from '@/lib/prisma';
import z from 'zod';
import { publicProcedure } from '../init';

export const blogPostComment = publicProcedure.input(z.object({ commentId: z.string() })).query(async ({ input: { commentId } }) => {
    const res = await prisma.blogPostComment.findUnique({
        where: { id: commentId },
        include: { _count: true, Author: { select: { name: true, avatarId: true } } },
    });

    return res;
});
