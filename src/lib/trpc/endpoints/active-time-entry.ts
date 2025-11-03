import { dayjs } from '@/lib/dayjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import z from 'zod';
import { publicProcedure } from '../init';

export const activeTimeEntry = publicProcedure.input(z.object({ memberId: z.string() })).query(async ({ input: { memberId } }) => {
    const session = await getSession();
    if (!session) return null;

    const timeEntry = await prisma.timeEntry.findFirst({
        where: { memberId, end: null },
    });

    if (!timeEntry) return null;

    return { ...timeEntry, startNowDiffMs: dayjs().diff(timeEntry.start, 'ms') };
});
