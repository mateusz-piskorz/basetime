import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import z from 'zod';
import { publicProcedure } from '../init';

export const activeTimeEntry = publicProcedure.input(z.object({ memberId: z.string() })).query(async ({ input: { memberId } }) => {
    const session = await getSession();
    if (!session) return null;

    return await prisma.timeEntry.findFirst({
        where: { memberId, end: null },
    });
});
