import { prisma } from '../prisma';
import { verifySession } from '../session';
import { createTRPCRouter, publicProcedure } from './init';

export const appRouter = createTRPCRouter({
    getUserActiveSessions: publicProcedure.query(async () => {
        const session = await verifySession();
        if (!session) return null;
        return await prisma.session.findMany({ where: { userId: session.id, expiresAt: { gte: new Date() } }, orderBy: { createdAt: 'asc' } });
    }),
});

export type AppRouter = typeof appRouter;
