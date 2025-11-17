import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import z from 'zod';
import { publicProcedure } from '../init';

export const kanbanColumnsLength = publicProcedure.input(z.object({ orgId: z.string() })).query(async ({ input: { orgId } }) => {
    const session = await getSession();
    if (!session) return 0;

    return await prisma.kanbanColumn.count({
        where: {
            Organization: {
                id: orgId,
                Members: { some: { userId: session.userId } },
            },
        },
    });
});
