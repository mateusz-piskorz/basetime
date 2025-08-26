import { prisma } from '../prisma';
import { verifySession } from '../session';
import { createTRPCRouter, publicProcedure } from './init';

export const appRouter = createTRPCRouter({
    getUsers: publicProcedure.query(async () => {
        const session = await verifySession();
        if (!session) return null;
        return await prisma.user.findMany();
    }),
});

export type AppRouter = typeof appRouter;
