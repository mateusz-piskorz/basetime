import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import z from 'zod';
import { publicProcedure } from '../init';

export const kanbanColumns = publicProcedure.input(z.object({ orgId: z.string() })).query(async ({ input: { orgId } }) => {
    const session = await getSession();
    if (!session) return [];

    const columns = await prisma.kanbanColumn.findMany({
        where: {
            Organization: {
                id: orgId,
                Members: { some: { userId: session.userId } },
            },
        },
        include: {
            Tasks: {
                orderBy: { updatedAt: 'desc' },
                include: {
                    _count: true,
                    Project: { select: { color: true, name: true } },
                    Assigned: { select: { User: { select: { name: true, avatarId: true, id: true } } } },
                },
            },
        },
        orderBy: { order: 'asc' },
    });

    return columns;
});
