import { formatMinutes, getDiffInMinutes, sumTimeEntries } from '@/lib/utils';
import { INVITATION_STATUS } from '@prisma/client';
import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { createTRPCRouter, publicProcedure } from './init';

export const appRouter = createTRPCRouter({
    getUserActiveSessions: publicProcedure.query(async () => {
        const session = await getSession();
        if (!session) return null;
        return await prisma.session.findMany({ where: { userId: session.id, expiresAt: { gte: new Date() } }, orderBy: { createdAt: 'asc' } });
    }),
    getUserInvitations: publicProcedure.query(async () => {
        const session = await getSession();
        if (!session) return null;
        return await prisma.invitation.findMany({
            select: { id: true, status: true, createdAt: true, Organization: { select: { name: true, id: true } } },
            where: { userId: session.id },
        });
    }),
    getOrganization: publicProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input: { organizationId } }) => {
        const session = await getSession();
        if (!session) return null;
        const res = await prisma.organization.findUnique({
            include: { Members: { where: { userId: session.id } } },
            where: { id: organizationId, Members: { some: { userId: session.id } } },
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
    getMemberTimeEntries: publicProcedure
        .input(
            z.object({
                memberId: z.string(),
                page: z.string().nullish(),
                limit: z.string().nullish(),
                order_column: z.string().nullish(),
                order_direction: z.string().nullish(),
                q: z.string().nullish(),
            }),
        )
        .query(async ({ input: { memberId, limit: limitInput, page: pageInput, order_column, order_direction, q } }) => {
            const limit = Number(limitInput) || 25;
            const page = Number(pageInput) || 1;
            const skip = (page - 1) * limit;
            const session = await getSession();
            if (!session) return null;
            const total = await prisma.timeEntry.count({ where: { memberId } });
            const res = await prisma.timeEntry.findMany({
                where: { memberId, ...(q && { name: { contains: q } }) },
                include: { Project: { select: { id: true, name: true, color: true } } },
                take: limit,
                skip,
                orderBy: { end: 'desc' },
                ...(order_column && { orderBy: { [order_column]: order_direction } }),
            });

            const data = res.map((timeEntry) => {
                return { ...timeEntry, duration: formatMinutes(getDiffInMinutes({ start: timeEntry.start, end: timeEntry.end })) };
            });

            const totalPages = Math.ceil(total / limit);
            return { totalPages, total, page, limit, data };
        }),

    getOrganizationInvitations: publicProcedure
        .input(
            z.object({
                organizationId: z.string(),
                page: z.string().nullish(),
                limit: z.string().nullish(),
                order_column: z.string().nullish(),
                order_direction: z.string().nullish(),
                statusArr: z.array(z.nativeEnum(INVITATION_STATUS)).nullish(),
            }),
        )
        .query(async ({ input: { organizationId, limit: limitInput, page: pageInput, order_column, order_direction, statusArr } }) => {
            const limit = Number(limitInput) || 25;
            const page = Number(pageInput) || 1;
            const skip = (page - 1) * limit;
            const session = await getSession();
            if (!session) return null;
            const total = await prisma.invitation.count({ where: { organizationId } });
            const data = await prisma.invitation.findMany({
                where: { organizationId, ...(statusArr?.length && { status: { in: statusArr } }) },
                include: { User: { select: { name: true, email: true } } },
                take: limit,
                skip,
                orderBy: { createdAt: 'desc' },
                ...(order_column && { orderBy: { [order_column]: order_direction } }),
            });

            const totalPages = Math.ceil(total / limit);
            return { totalPages, total, page, limit, data };
        }),
    // getOrganizationInvitations: publicProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input: { organizationId } }) => {
    //     const session = await getSession();
    //     if (!session) return null;
    //     return await prisma.invitation.findMany({
    //         select: { id: true, status: true, createdAt: true, User: { select: { id: true, name: true, email: true } } },
    //         where: { Organization: { id: organizationId, Members: { some: { userId: session.id } } } },
    //     });
    // }),
    getMembers: publicProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input: { organizationId } }) => {
        const session = await getSession();
        if (!session) return null;
        const res = await prisma.organization.findUnique({
            where: { id: organizationId, Members: { some: { userId: session.id, role: { in: ['MANAGER', 'OWNER'] } } } },
            select: {
                Members: {
                    select: {
                        HourlyRates: { take: 1 },
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
            const hourlyRate = member.HourlyRates.length > 0 ? member.HourlyRates[0].value : undefined;
            return { ...member, loggedTime: sumTimeEntries(member.TimeEntries), hourlyRate };
        });
    }),
    getProjects: publicProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input: { organizationId } }) => {
        const session = await getSession();
        if (!session) return null;
        const res = await prisma.organization.findUnique({
            where: { id: organizationId, Members: { some: { userId: session.id, role: { in: ['MANAGER', 'OWNER'] } } } },
            select: {
                Projects: { select: { _count: true, TimeEntries: { select: { start: true, end: true } }, name: true, createdAt: true, id: true } },
            },
        });

        return res?.Projects.map((project) => {
            return { ...project, loggedTime: sumTimeEntries(project.TimeEntries) };
        });
    }),
    getMemberProjects: publicProcedure
        .input(z.object({ organizationId: z.string(), memberId: z.string() }))
        .query(async ({ input: { organizationId, memberId } }) => {
            const session = await getSession();
            if (!session) return null;
            const res = await prisma.organization.findUnique({
                where: { id: organizationId, Members: { some: { userId: session.id } } },
                select: {
                    Projects: {
                        where: { Members: { some: { id: memberId } } },
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
                return { ...project, loggedTime: sumTimeEntries(project.TimeEntries) };
            });
        }),
    getUserOrganizations: publicProcedure.query(async () => {
        const session = await getSession();
        if (!session) return null;
        const res = await prisma.organization.findMany({
            where: { Members: { some: { userId: session.id } } },
            select: {
                id: true,
                name: true,
                _count: true,
                TimeEntries: { select: { id: true, start: true, end: true } },
            },
        });

        return res.map((organization) => {
            return { ...organization, loggedTime: sumTimeEntries(organization.TimeEntries) };
        });
    }),
});

export type AppRouter = typeof appRouter;
