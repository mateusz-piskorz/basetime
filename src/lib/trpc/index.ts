import { formatMinutes, getDiffInMinutes } from '@/lib/utils';
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
        return await prisma.organization.findUnique({ where: { id: organizationId, Members: { some: { userId: session.id } } } });
    }),
    getOrganizationInvitations: publicProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input: { organizationId } }) => {
        const session = await getSession();
        if (!session) return null;
        return await prisma.invitation.findMany({
            select: { id: true, status: true, createdAt: true, User: { select: { id: true, name: true, email: true } } },
            where: { Organization: { id: organizationId, Members: { some: { userId: session.id } } } },
        });
    }),
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
            const totalMinutes = member.TimeEntries.reduce((sum, entry) => {
                return sum + getDiffInMinutes({ start: entry.start, end: entry.end });
            }, 0);
            const hourlyRate = member.HourlyRates.length > 0 ? member.HourlyRates[0].value : undefined;
            return { ...member, loggedTime: formatMinutes(totalMinutes), hourlyRate };
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
            const totalMinutes = organization.TimeEntries.reduce((sum, entry) => {
                return sum + getDiffInMinutes({ start: entry.start, end: entry.end });
            }, 0);

            return { ...organization, loggedTime: formatMinutes(totalMinutes) };
        });
    }),
});

export type AppRouter = typeof appRouter;
