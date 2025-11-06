import { dayjs } from '@/lib/dayjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { formatMinutes, sumTimeEntries } from '@/lib/utils/common';
import z from 'zod';
import { publicProcedure } from '../init';

export const members = publicProcedure.input(z.object({ orgId: z.string() })).query(async ({ input: { orgId } }) => {
    const session = await getSession();
    if (!session) return [];

    const res = await prisma.member.findMany({
        where: { organizationId: orgId },
        include: {
            _count: true,
            HourlyRates: {
                take: 1,
                where: {
                    OR: [
                        { Member: { userId: session.userId } },
                        { Member: { Organization: { Members: { some: { userId: session.userId, role: { in: ['MANAGER', 'OWNER'] } } } } } },
                    ],
                },
                orderBy: { createdAt: 'desc' },
            },
            User: { select: { id: true, name: true, email: true, avatarId: true } },
            TimeEntries: true,
            Projects: true,
            Organization: { select: { roundUpSecondsThreshold: true } },
        },
    });

    return Promise.all(
        res.map(async (member) => {
            const hourlyRate = member.HourlyRates?.length > 0 ? member.HourlyRates[0].value : undefined;
            return {
                ...member,
                User: member.User,
                loggedTime: formatMinutes(
                    sumTimeEntries({ entries: member.TimeEntries, dayjs, roundUpSecondsThreshold: member.Organization.roundUpSecondsThreshold }),
                ),
                hourlyRate,
            };
        }),
    );
});
