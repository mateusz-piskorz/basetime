import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { publicProcedure } from '../init';

export const activeSessions = publicProcedure.query(async () => {
    const session = await getSession();
    if (!session) return [];
    return await prisma.session.findMany({ where: { userId: session.userId, expiresAt: { gte: new Date() } }, orderBy: { createdAt: 'asc' } });
});
