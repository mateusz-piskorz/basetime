import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import z from 'zod';
import { publicProcedure } from '../init';

export const blogPostUpvote = publicProcedure.input(z.object({ postId: z.string() })).query(async ({ input: { postId } }) => {
    const session = await getSession();

    if (!session) {
        return { userUpvoted: false };
    }

    const upvote = await prisma.blogPostUpvote.findFirst({
        where: { userId: session.userId, postId },
    });

    return { userUpvoted: Boolean(upvote) };
});
