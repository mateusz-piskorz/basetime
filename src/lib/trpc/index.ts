import { formatMinutes, getDurationInMinutes, sumTimeEntries } from '@/lib/utils/common';
import { INVITATION_STATUS } from '@prisma/client';
import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { createTRPCRouter, publicProcedure } from './init';

export const appRouter = createTRPCRouter({
    getUserActiveSessions: publicProcedure.query(async () => {
        const session = await getSession();
        if (!session) return null;
        return await prisma.session.findMany({ where: { userId: session.userId, expiresAt: { gte: new Date() } }, orderBy: { createdAt: 'asc' } });
    }),

    getOrganization: publicProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input: { organizationId } }) => {
        const session = await getSession();
        if (!session) return null;
        const res = await prisma.organization.findUnique({
            include: { Members: { where: { userId: session.userId } } },
            where: { id: organizationId, Members: { some: { userId: session.userId } } },
        });
        if (!res?.Members[0]) return null;
        return { ...res, member: res.Members[0] };
    }),

    getActiveTimeEntry: publicProcedure.input(z.object({ memberId: z.string() })).query(async ({ input: { memberId } }) => {
        const session = await getSession();
        if (!session) return null;
        return await prisma.timeEntry.findFirst({
            where: { memberId, end: null },
        });
    }),

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

    // todo add permissions, check if we need organizationId/memberId, maybe session is enough
    getTimeEntriesPaginated: publicProcedure
        .input(
            z.object({
                memberId: z.string(),
                page: z.string().nullish(),
                limit: z.string().nullish(),
                order_column: z.string().nullish(),
                order_direction: z.string().nullish(),
                q: z.string().nullish(),
                startDate: z.date().nullish(),
                endDate: z.date().nullish(),
            }),
        )
        .query(async ({ input: { memberId, limit: limitInput, page: pageInput, order_column, order_direction, q, endDate, startDate } }) => {
            const limit = Number(limitInput) || 25;
            const page = Number(pageInput) || 1;
            const skip = (page - 1) * limit;
            const session = await getSession();
            if (!session) return null;
            const total = await prisma.timeEntry.count({ where: { memberId } });
            const res = await prisma.timeEntry.findMany({
                where: {
                    memberId,
                    OR: [
                        { ...(endDate && { end: { lte: endDate } }), ...(startDate && { start: { gte: startDate } }) },
                        { end: null, ...(endDate && { start: { lte: endDate } }) },
                    ],
                    ...(q && { name: { contains: q } }),
                },
                include: { Project: { select: { id: true, name: true, color: true } } },
                take: limit,
                skip,
                orderBy: { end: 'desc' },
                ...(order_column && { orderBy: { [order_column]: order_direction } }),
            });

            const data = res.map((timeEntry) => {
                return { ...timeEntry, duration: formatMinutes(getDurationInMinutes({ start: timeEntry.start, end: timeEntry.end })) };
            });

            const totalPages = Math.ceil(total / limit);
            return { totalPages, total, page, limit, data };
        }),

    getInvitations: publicProcedure
        .input(
            z.object({
                q: z.string().nullish(),
                organizationId: z.string().nullish(),
                page: z.string().nullish(),
                limit: z.string().nullish(),
                order_column: z.string().nullish(),
                order_direction: z.string().nullish(),
                status: z.array(z.nativeEnum(INVITATION_STATUS)).nullish(),
            }),
        )
        .query(async ({ input: { q, organizationId, limit: limitInput, page: pageInput, order_column, order_direction, status } }) => {
            const limit = Number(limitInput) || 25;
            const page = Number(pageInput) || 1;
            const skip = (page - 1) * limit;
            const session = await getSession();
            if (!session) return { totalPages: 0, total: 0, page, limit, data: [] };
            const total = await prisma.invitation.count({ where: { ...(organizationId ? { organizationId } : { userId: session.userId }) } });
            const data = await prisma.invitation.findMany({
                where: {
                    ...(q && { Organization: { name: { contains: q } } }),
                    ...(organizationId
                        ? {
                              organizationId,
                              Organization: { Members: { some: { role: { in: ['MANAGER', 'OWNER'] }, User: { id: session.userId } } } },
                          }
                        : { userId: session.userId }),
                    ...(status?.length && { status: { in: status } }),
                },
                include: { User: { select: { name: true, email: true } }, Organization: { select: { name: true } } },
                take: limit,
                skip,
                orderBy: order_column ? { [order_column]: order_direction } : { createdAt: 'desc' },
            });

            const totalPages = Math.ceil(total / limit);
            return { totalPages, total, page, limit, data };
        }),

    getMembers: publicProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input: { organizationId } }) => {
        const session = await getSession();
        if (!session) return null;

        const userMember = await prisma.member.findFirst({ where: { userId: session.userId, organizationId } });
        if (!userMember) {
            return null;
        }

        const res = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: {
                Members: {
                    select: {
                        HourlyRates: { take: 1, ...(userMember.role === 'EMPLOYEE' && { where: { memberId: userMember.id } }) },
                        Projects: { select: { id: true } },
                        id: true,
                        _count: true,
                        TimeEntries: { select: { start: true, end: true } },
                        role: true,
                        User: { select: { id: true, name: true, email: true } },
                    },
                },
            },
        });

        return res?.Members.map((member) => {
            const hourlyRate = member.HourlyRates?.length > 0 ? member.HourlyRates[0].value : undefined;
            return { ...member, loggedTime: formatMinutes(sumTimeEntries(member.TimeEntries)), hourlyRate };
        });
    }),

    getProjects: publicProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input: { organizationId } }) => {
        const session = await getSession();
        if (!session) return null;
        const res = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: {
                Projects: {
                    select: {
                        color: true,
                        Members: true,
                        estimatedMinutes: true,
                        _count: true,
                        TimeEntries: { select: { start: true, end: true } },
                        name: true,
                        createdAt: true,
                        id: true,
                    },
                },
            },
        });
        return res?.Projects.map((project) => {
            const loggedMinutes = sumTimeEntries(project.TimeEntries);
            const percentCompleted = project.estimatedMinutes ? ((loggedMinutes / project.estimatedMinutes) * 100).toFixed(2) : undefined;

            return { ...project, loggedTime: formatMinutes(loggedMinutes), loggedMinutes, percentCompleted };
        });
    }),

    getMemberProjects: publicProcedure
        .input(z.object({ organizationId: z.string(), memberId: z.string() }))
        .query(async ({ input: { organizationId, memberId } }) => {
            const session = await getSession();
            if (!session) return null;

            const currentMember = await prisma.member.findFirst({ where: { userId: session.userId, organizationId } });
            if (!currentMember) {
                return null;
            }

            const res = await prisma.organization.findUnique({
                where: { id: organizationId, Members: { some: { userId: session.userId } } },
                select: {
                    Projects: {
                        ...(currentMember.role === 'EMPLOYEE' && { where: { Members: { some: { id: memberId } } } }),
                        select: {
                            color: true,
                            _count: true,
                            TimeEntries: { select: { start: true, end: true } },
                            name: true,
                            createdAt: true,
                            id: true,
                        },
                    },
                },
            });

            return res?.Projects.map((project) => {
                return { ...project, loggedTime: formatMinutes(sumTimeEntries(project.TimeEntries)) };
            });
        }),

    getUserOrganizations: publicProcedure.query(async () => {
        const session = await getSession();
        if (!session) return null;
        const res = await prisma.organization.findMany({
            where: { Members: { some: { userId: session.userId } } },
            select: {
                id: true,
                name: true,
                _count: true,
                TimeEntries: { select: { id: true, start: true, end: true } },
            },
        });

        return res.map((organization) => {
            return { ...organization, loggedTime: formatMinutes(sumTimeEntries(organization.TimeEntries)) };
        });
    }),
});

export type AppRouter = typeof appRouter;
