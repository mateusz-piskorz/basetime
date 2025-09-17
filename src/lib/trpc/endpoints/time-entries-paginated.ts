import { dayjs } from '@/lib/dayjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { formatMinutes, getDurationInMinutes } from '@/lib/utils/common';
import { MEMBER_ROLE } from '@prisma/client';
import z from 'zod';
import { publicProcedure } from '../init';

export const timeEntriesPaginated = publicProcedure
    .input(
        z.object({
            organizationId: z.string(),
            projectIds: z.array(z.string()).nullish(),
            memberIds: z.array(z.string()).nullish(),
            page: z.string().nullish(),
            limit: z.string().nullish(),
            takeAll: z.boolean().nullish(),
            order_column: z.string().nullish(),
            order_direction: z.string().nullish(),
            q: z.string().nullish(),
            startDate: z.string().nullish(),
            endDate: z.string().nullish(),
        }),
    )
    .query(
        async ({
            input: {
                organizationId,
                memberIds,
                projectIds,
                limit: limitInput,
                order_column,
                order_direction,
                page: pageInput,
                q,
                takeAll,
                startDate,
                endDate,
            },
        }) => {
            const session = await getSession();
            if (!session) return { totalPages: 0, total: 0, page: 1, limit: 25, data: [] };

            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;

            const limit = Number(limitInput) || 25;
            const page = Number(pageInput) || 1;
            const skip = (page - 1) * limit;

            const where = {
                organizationId,
                ...(q && { name: { contains: q } }),
                ...(memberIds?.length
                    ? {
                          memberId: { in: memberIds },
                          OR: [
                              { Member: { userId: session.userId } },
                              {
                                  Organization: {
                                      Members: { some: { userId: session.userId, role: { in: ['MANAGER', 'OWNER'] as MEMBER_ROLE[] } } },
                                  },
                              },
                          ],
                      }
                    : { Member: { userId: session.userId } }),
                ...(projectIds?.length && {
                    Project: {
                        id: { in: projectIds },
                        OR: [
                            { Members: { some: { userId: session.userId } } },
                            { Organization: { Members: { some: { userId: session.userId, role: { in: ['MANAGER', 'OWNER'] as MEMBER_ROLE[] } } } } },
                        ],
                    },
                }),
                ...((start || end) && {
                    OR: [
                        { ...(end && { end: { lte: end } }), ...(start && { start: { gte: start } }) },
                        ...(end ? [{ end: null, start: { lte: end } }] : []),
                    ],
                }),
            };

            const total = await prisma.timeEntry.count({
                where,
            });

            const res = await prisma.timeEntry.findMany({
                include: { Project: { select: { name: true, color: true } } },
                where,
                ...(!takeAll && { take: limit }),
                skip,
                orderBy: order_column ? { [order_column]: order_direction } : { createdAt: 'desc' },
            });

            const data = res.map((timeEntry) => {
                return { ...timeEntry, duration: formatMinutes(getDurationInMinutes({ start: timeEntry.start, end: timeEntry.end, dayjs })) };
            });

            const totalPages = Math.ceil(total / limit);
            return { totalPages, total, page, limit, data };
        },
    );
