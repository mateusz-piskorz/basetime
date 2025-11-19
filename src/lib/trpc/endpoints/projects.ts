import { dayjs } from '@/lib/dayjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { formatMinutes, sumTimeEntries } from '@/lib/utils/common';
import z from 'zod';
import { publicProcedure } from '../init';

export const projects = publicProcedure.input(z.object({ orgId: z.string() })).query(async ({ input: { orgId } }) => {
    const session = await getSession();
    if (!session) return [];

    const res = await prisma.project.findMany({
        where: {
            organizationId: orgId,
            OR: [
                { Members: { some: { userId: session.userId } } },
                { Organization: { Members: { some: { userId: session.userId, role: { in: ['OWNER', 'MANAGER'] } } } } },
            ],
        },
        include: { _count: true, TimeEntries: true, Members: true, Organization: { select: { roundUpSecondsThreshold: true } } },
    });

    return res.map((project) => {
        const loggedMinutes = sumTimeEntries({
            entries: project.TimeEntries,
            dayjs,
            roundUpSecondsThreshold: project.Organization.roundUpSecondsThreshold,
        });
        const percentCompleted = project.estimatedMinutes ? Number(((loggedMinutes / project.estimatedMinutes) * 100).toFixed(2)) : undefined;

        return { ...project, loggedTime: formatMinutes(loggedMinutes), loggedMinutes, percentCompleted };
    });
});
