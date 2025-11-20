import { dayjs } from '@/lib/dayjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { sumTimeEntries } from '@/lib/utils/common';
import z from 'zod';
import { publicProcedure } from '../init';

export const task = publicProcedure.input(z.object({ taskId: z.string() })).query(async ({ input: { taskId } }) => {
    const session = await getSession();
    if (!session) return null;

    const res = await prisma.task.findUnique({
        where: {
            id: taskId,
            Organization: {
                Members: { some: { userId: session.userId } },
            },
        },
        include: { Project: true, TimeEntries: true, Organization: true },
    });
    if (!res) return null;

    const loggedMinutes = sumTimeEntries({
        entries: res.TimeEntries,
        dayjs,
        roundUpSecondsThreshold: res.Organization.roundUpSecondsThreshold,
    });

    const percentCompleted = res.estimatedMinutes ? Number(((loggedMinutes / res.estimatedMinutes) * 100).toFixed(2)) : undefined;

    return { ...res, loggedMinutes, percentCompleted };
});
