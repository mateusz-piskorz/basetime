import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import z from 'zod';
import { publicProcedure } from '../init';

export const timeEntriesByMember = publicProcedure
    .input(
        z.object({
            organizationId: z.string(),
            projectIds: z.array(z.string()).nullish(),
            memberIds: z.array(z.string()).nullish(),
            startDate: z.string().nullish(),
            endDate: z.string().nullish(),
        }),
    )
    .query(async ({ input: { organizationId, memberIds, projectIds, startDate, endDate } }) => {
        const session = await getSession();
        if (!session) return [];

        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;

        const res = await prisma.member.findMany({
            where: {
                organizationId,

                ...(memberIds?.length && { id: { in: memberIds } }),
                OR: [
                    { userId: session.userId },
                    { Organization: { Members: { some: { userId: session.userId, role: { in: ['MANAGER', 'OWNER'] } } } } },
                ],
            },
            select: {
                id: true,
                HourlyRates: { take: 1 },
                TimeEntries: {
                    where: {
                        ...(projectIds?.length && {
                            Project: {
                                id: { in: projectIds },
                                OR: [
                                    { Members: { some: { userId: session.userId } } },
                                    { Organization: { Members: { some: { userId: session.userId, role: { in: ['MANAGER', 'OWNER'] } } } } },
                                ],
                            },
                        }),

                        ...((start || end) && {
                            OR: [
                                { ...(end && { end: { lte: end } }), ...(start && { start: { gte: start } }) },
                                ...(end ? [{ end: null, start: { lte: end } }] : []),
                            ],
                        }),
                    },
                    select: {
                        id: true,
                        name: true,
                        start: true,
                        end: true,
                        Project: { select: { id: true, name: true, color: true } },
                        projectId: true,
                    },
                },
            },
        });

        return res.map((member) => {
            const hourlyRate = member.HourlyRates?.length > 0 ? member.HourlyRates[0].value : undefined;
            return { TimeEntries: member.TimeEntries, hourlyRate, id: member.id };
        });
    });
