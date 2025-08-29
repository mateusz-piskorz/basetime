import { formatMinutes, getDiffInMinutes } from '@/lib/utils';
import z from 'zod';
import { prisma } from '../prisma';
import { verifySession } from '../session';
import { createTRPCRouter, publicProcedure } from './init';

export const appRouter = createTRPCRouter({
    getUserActiveSessions: publicProcedure.query(async () => {
        const session = await verifySession();
        if (!session) return null;
        return await prisma.session.findMany({ where: { userId: session.id, expiresAt: { gte: new Date() } }, orderBy: { createdAt: 'asc' } });
    }),
    getOrganization: publicProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input: { organizationId } }) => {
        const session = await verifySession();
        if (!session) return null;
        return await prisma.organization.findUnique({ where: { id: organizationId, Members: { some: { userId: session.id } } } });
    }),
    getUserOrganizations: publicProcedure.query(async () => {
        const session = await verifySession();
        if (!session) return null;
        const res = await prisma.organization.findMany({
            where: { Members: { some: { userId: session.id } } },
            select: {
                id: true,
                name: true,
                _count: true,
                TimeEntries: { select: { id: true, start: true, end: true } },
                Projects: { select: { _count: true } },
                Members: { select: { _count: true } },
                PersonalOwner: { select: { id: true } },
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
