import { dayjs } from '@/lib/dayjs';
import { getOrgLogoUrl } from '@/lib/minio';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { formatMinutes, sumTimeEntries } from '@/lib/utils/common';
import z from 'zod';
import { publicProcedure } from '../init';

export const organizations = publicProcedure
    .input(z.object({ organizationId: z.string().nullish(), limit: z.number().optional() }))
    .query(async ({ input: { organizationId, limit } }) => {
        const session = await getSession();
        if (!session) return [];

        const res = await prisma.organization.findMany({
            where: {
                ...(organizationId && { id: organizationId }),
                Members: { some: { userId: session.userId } },
            },
            include: {
                _count: true,
                TimeEntries: true,
                Members: { where: { userId: session.userId } },
            },
            take: limit,
        });

        return Promise.all(
            res.map(async (organization) => {
                const member = organization.Members[0];
                const logo = await getOrgLogoUrl({ organizationId: organization.id });

                return {
                    ...organization,
                    loggedTime: formatMinutes(sumTimeEntries({ entries: organization.TimeEntries, dayjs })),
                    ownership: member.role === 'OWNER',
                    member,
                    logo,
                };
            }),
        );
    });
