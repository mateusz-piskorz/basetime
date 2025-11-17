import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import z from 'zod';
import { publicProcedure } from '../init';

export const tasks = publicProcedure
    .input(z.object({ orgId: z.string(), projectId: z.string(), assignedMember: z.string().nullish() }))
    .query(async ({ input: { orgId, projectId, assignedMember } }) => {
        const session = await getSession();
        if (!session) return [];

        return await prisma.task.findMany({
            where: {
                Organization: {
                    id: orgId,
                    Members: { some: { userId: session.userId } },
                },
                projectId,
                assignedId: assignedMember,
            },
        });
    });
