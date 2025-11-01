import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { INVITATION_STATUS } from '@prisma/client';
import z from 'zod';
import { publicProcedure } from '../init';

export const invitations = publicProcedure
    .input(
        z.object({
            orgId: z.string().nullish(),
            q: z.string().nullish(),
            queryColumn: z.enum(['ORGANIZATION_NAME', 'USER_NAME']).nullish(),
            page: z.number().nullish(),
            limit: z.number().nullish(),
            order_column: z.string().nullish(),
            order_direction: z.string().nullish(),
            status: z.array(z.nativeEnum(INVITATION_STATUS)).nullish(),
        }),
    )
    .query(async ({ input: { q, queryColumn, orgId, limit: limitInput, page: pageInput, order_column, order_direction, status } }) => {
        const limit = Number(limitInput) || 25;
        const page = Number(pageInput) || 1;
        const skip = (page - 1) * limit;
        const session = await getSession();
        if (!session) return { totalPages: 1, total: 0, page, limit, data: [] };

        const total = await prisma.invitation.count({ where: { ...(orgId ? { organizationId: orgId } : { userId: session.userId }) } });
        const data = await prisma.invitation.findMany({
            where: {
                ...(queryColumn === 'ORGANIZATION_NAME' && q && { Organization: { name: { contains: q } } }),
                ...(queryColumn === 'USER_NAME' && q && { User: { OR: [{ name: { contains: q } }, { email: { contains: q } }] } }),
                ...(orgId
                    ? {
                          organizationId: orgId,
                          Organization: { Members: { some: { role: { in: ['MANAGER', 'OWNER'] }, User: { id: session.userId } } } },
                      }
                    : { userId: session.userId }),
                ...(status?.length && { status: { in: status } }),
            },
            include: { User: { select: { name: true, email: true } }, Organization: { select: { name: true } } },
            take: limit,
            skip,
            orderBy: order_column ? { [order_column]: order_direction } : { createdAt: 'desc' },
        });

        const totalPages = Math.ceil(total / limit) || 1;
        return { totalPages, total, page, limit, data };
    });
