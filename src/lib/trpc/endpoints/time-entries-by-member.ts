import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import z from 'zod';
import { publicProcedure } from '../init';

export const timeEntriesByMember = publicProcedure
    .input(
        z.object({
            orgId: z.string(),
            projectIds: z.array(z.string()).nullish(),
            members: z.union([z.array(z.string()), z.literal('all')]).nullish(),
            startDate: z.string().nullish(),
            endDate: z.string().nullish(),
        }),
    )
    .query(async ({ input: { orgId, members, projectIds, startDate, endDate } }) => {
        const session = await getSession();
        if (!session) return [];

        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;

        const res = await prisma.member.findMany({
            where: {
                organizationId: orgId,
                ...(members === 'all'
                    ? { Organization: { Members: { some: { userId: session.userId, role: { in: ['MANAGER', 'OWNER'] } } } } }
                    : members?.length
                      ? {
                            id: { in: members },
                            OR: [
                                { userId: session.userId },
                                { Organization: { Members: { some: { userId: session.userId, role: { in: ['MANAGER', 'OWNER'] } } } } },
                            ],
                        }
                      : { userId: session.userId }),
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
