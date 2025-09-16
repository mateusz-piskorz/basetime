import { dayjs } from '@/lib/dayjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { formatMinutes, sumTimeEntries } from '@/lib/utils/common';
import z from 'zod';
import { publicProcedure } from '../init';

export const projects = publicProcedure.input(z.object({ organizationId: z.string() })).query(async ({ input: { organizationId } }) => {
    const session = await getSession();
    if (!session) return [];

    const res = await prisma.project.findMany({
        where: {
            organizationId,
            OR: [
                { Members: { some: { userId: session.userId } } },
                { Organization: { Members: { some: { userId: session.userId, role: { in: ['OWNER', 'MANAGER'] } } } } },
            ],
        },
        include: { _count: true, TimeEntries: true, Members: true },
    });

    return res.map((project) => {
        const loggedMinutes = sumTimeEntries({ entries: project.TimeEntries, dayjs });
        const percentCompleted = project.estimatedMinutes ? ((loggedMinutes / project.estimatedMinutes) * 100).toFixed(2) : undefined;

        return { ...project, loggedTime: formatMinutes(loggedMinutes), loggedMinutes, percentCompleted };
    });
});
