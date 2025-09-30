'use server';

import { action } from '.';
import { prisma } from '../prisma';
import { createInvSchemaS, updateInvSchemaS } from '../zod/invitation-schema';

export const createInv = action(createInvSchemaS, async ({ email, organizationId }, { userId }) => {
    try {
        const userMember = await prisma.member.findFirst({ where: { userId, organizationId, role: { in: ['OWNER'] } } });
        if (!userMember) return { success: false, message: 'Error permission' };

        const user = await prisma.user.findUnique({
            where: { email },
            select: { Members: { select: { organizationId: true } }, id: true, Invitations: { select: { organizationId: true, status: true } } },
        });

        if (!user) return { success: false, message: `Error couldn't find user with email ${email}` };
        if (user.Members.some((e) => e.organizationId === organizationId)) {
            return { success: false, message: `Error ${email} is already a member of this organization` };
        }
        if (user.Invitations.find((e) => e.organizationId === organizationId && e.status === 'SENT')) {
            return { success: false, message: `Error invitation was already sent to ${email}` };
        }

        const res = await prisma.invitation.create({ data: { status: 'SENT', organizationId, userId: user.id } });

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error - createInv' };
    }
});

export const updateInvStatus = action(updateInvSchemaS, async ({ invitationId, status }, { userId }) => {
    try {
        const res = await prisma.invitation.update({
            where: {
                id: invitationId,
                status: 'SENT',
                ...(status === 'CANCELED' ? { Organization: { Members: { some: { userId, role: { in: ['OWNER'] } } } } } : { userId }),
            },
            data: {
                status,
                ...(status === 'ACCEPTED' && { Organization: { update: { Members: { create: { role: 'EMPLOYEE', userId } } } } }),
            },
        });

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error - updateInvStatus' };
    }
});
