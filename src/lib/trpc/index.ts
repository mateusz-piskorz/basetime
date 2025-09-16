import { dayjs } from '@/lib/dayjs';
import { formatMinutes, getDurationInMinutes } from '@/lib/utils/common';
import { MEMBER_ROLE } from '@prisma/client';
import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { activeSessions } from './endpoints/active-sessions';
import { activeTimeEntry } from './endpoints/active-time-entry';
import { invitations } from './endpoints/invitations';
import { members } from './endpoints/members';
import { organizations } from './endpoints/organizations';
import { projects } from './endpoints/projects';
import { createTRPCRouter, publicProcedure } from './init';

export const appRouter = createTRPCRouter({
    activeSessions,
    organizations,
    members,
    projects,
    invitations,
    activeTimeEntry,

    getTimeEntries: publicProcedure
        .input(
            z.object({
                organizationId: z.string(),
                projectIds: z.array(z.string()).nullish(),
                memberIds: z.array(z.string()).nullish(),
                startDate: z.string().nullish(),
                endDate: z.string().nullish(),
                limit: z.number().nullish(),
            }),
        )
        .query(async ({ input: { organizationId, memberIds, projectIds, limit, startDate, endDate } }) => {
            const session = await getSession();
            if (!session) return null;

            const start = startDate ? new Date(startDate) : undefined;
            const end = endDate ? new Date(endDate) : undefined;

            const res = await prisma.member.findMany({
                where: {
                    organizationId,

                    //member
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
                            // project
                            ...(projectIds?.length && {
                                Project: {
                                    id: { in: projectIds },
                                    OR: [
                                        { Members: { some: { userId: session.userId } } },
                                        { Organization: { Members: { some: { userId: session.userId, role: { in: ['MANAGER', 'OWNER'] } } } } },
                                    ],
                                },
                            }),

                            //date
                            ...((start || end) && {
                                OR: [
                                    { ...(end && { end: { lte: end } }), ...(start && { start: { gte: start } }) },
                                    ...(end ? [{ end: null, start: { lte: end } }] : []),
                                ],
                            }),
                        },
                        select: { id: true, name: true, start: true, end: true, Project: { select: { id: true, name: true, color: true } } },
                        orderBy: { createdAt: 'desc' },
                        ...(limit && { take: limit }),
                    },
                },
            });

            return {
                timeEntriesByMembers: res.map((member) => {
                    const hourlyRate = member.HourlyRates?.length > 0 ? member.HourlyRates[0].value : undefined;
                    return { TimeEntries: member.TimeEntries, hourlyRate, id: member.id };
                }),
                timeEntries: res.flatMap((member) => member.TimeEntries),
            };
        }),

    getTimeEntriesPaginated: publicProcedure
        .input(
            z.object({
                organizationId: z.string(),
                projectIds: z.array(z.string()).nullish(),
                memberIds: z.array(z.string()).nullish(),
                page: z.string().nullish(),
                limit: z.string().nullish(),
                order_column: z.string().nullish(),
                order_direction: z.string().nullish(),
                q: z.string().nullish(),
            }),
        )
        .query(async ({ input: { organizationId, memberIds, projectIds, limit: limitInput, order_column, order_direction, page: pageInput, q } }) => {
            const session = await getSession();
            if (!session) return null;

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
            };

            const total = await prisma.timeEntry.count({
                where,
            });

            const res = await prisma.timeEntry.findMany({
                include: { Project: { select: { name: true, color: true } } },
                where,
                take: limit,
                skip,
                orderBy: order_column ? { [order_column]: order_direction } : { createdAt: 'desc' },
            });

            const data = res.map((timeEntry) => {
                return { ...timeEntry, duration: formatMinutes(getDurationInMinutes({ start: timeEntry.start, end: timeEntry.end, dayjs })) };
            });

            const totalPages = Math.ceil(total / limit);
            return { totalPages, total, page, limit, data };
        }),
});

export type AppRouter = typeof appRouter;
