import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { TASK_PRIORITY } from '@prisma/client';
import z from 'zod';
import { publicProcedure } from '../init';

export const kanbanColumns = publicProcedure
    .input(
        z.object({
            orgId: z.string(),
            priorities: z.array(z.nativeEnum(TASK_PRIORITY)).optional(),
            assignedMemberIds: z.array(z.string()).optional(),
            projectIds: z.array(z.string()).optional(),
        }),
    )
    .query(async ({ input: { orgId, priorities, projectIds, assignedMemberIds } }) => {
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
                    where: {
                        ...(priorities?.length && { priority: { in: priorities } }),
                        ...(assignedMemberIds?.length && { assignedId: { in: assignedMemberIds } }),
                        ...(projectIds?.length && { projectId: { in: projectIds } }),
                    },
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
