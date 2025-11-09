import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { MEMBER_ROLE } from '@prisma/client';
import z from 'zod';
import { publicProcedure } from '../init';

export const tasksPaginated = publicProcedure
    .input(
        z.object({
            orgId: z.string(),
            projects: z.array(z.string()).nullish(),
            assignedIds: z.union([z.array(z.string()), z.literal('all')]).nullish(),
            page: z.number().nullish(),
            limit: z.number().nullish(),
            order_column: z.string().nullish(),
            order_direction: z.string().nullish(),
            q: z.string().nullish(),
        }),
    )
    .query(async ({ input: { orgId, assignedIds, projects, limit: limitInput, order_column, order_direction, page: pageInput, q } }) => {
        const session = await getSession();
        if (!session) return { totalPages: 1, total: 0, page: 1, limit: 25, data: [] };

        const limit = Number(limitInput) || undefined;
        const page = Number(pageInput) || 1;
        const skip = limit ? (page - 1) * limit : undefined;

        const where = {
            organizationId: orgId,
            ...(q && { name: { contains: q } }),
            ...(assignedIds === 'all'
                ? {
                      Organization: {
                          Members: { some: { userId: session.userId, role: { in: ['MANAGER', 'OWNER'] as MEMBER_ROLE[] } } },
                      },
                  }
                : assignedIds?.length
                  ? {
                        assignedId: { in: assignedIds },
                        OR: [
                            { Assigned: { userId: session.userId } },
                            {
                                Organization: {
                                    Members: { some: { userId: session.userId, role: { in: ['MANAGER', 'OWNER'] as MEMBER_ROLE[] } } },
                                },
                            },
                        ],
                    }
                  : { Assigned: { userId: session.userId } }),
            ...(projects?.length && {
                Project: {
                    id: { in: projects },
                    OR: [
                        { Members: { some: { userId: session.userId } } },
                        { Organization: { Members: { some: { userId: session.userId, role: { in: ['MANAGER', 'OWNER'] as MEMBER_ROLE[] } } } } },
                    ],
                },
            }),
        };

        const total = await prisma.task.count({
            where,
        });

        const res = await prisma.task.findMany({
            include: { Project: { select: { name: true, color: true } }, Organization: { select: { roundUpSecondsThreshold: true } } },
            where,
            take: limit,
            skip,
            orderBy: order_column ? { [order_column]: order_direction } : { createdAt: 'desc' },
        });

        const totalPages = limit ? Math.ceil(total / limit) : 1;
        return { totalPages, total, page, limit, data: res };
    });
