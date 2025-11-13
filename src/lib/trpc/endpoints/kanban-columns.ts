import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import z from 'zod';
import { publicProcedure } from '../init';

export const kanbanColumns = publicProcedure.input(z.object({ orgId: z.string() })).query(async ({ input: { orgId } }) => {
    const session = await getSession();
    if (!session) return [];

    return await prisma.kanbanColumn.findMany({
        where: {
            Organization: {
                id: orgId,
                Members: { some: { userId: session.userId, role: { in: ['OWNER', 'MANAGER'] } } },
            },
        },
        include: { Tasks: { orderBy: { taskAboveId: 'desc' }, include: { Assigned: { select: { User: { select: { name: true } } } } } } },
        orderBy: { order: 'asc' },
    });
});
