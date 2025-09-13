'use server';

import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { createInvitationServerSchema, updateInvitationStatusServerSchema } from '../zod/invitation-schema';

export const createInvitation = async (data: z.infer<typeof createInvitationServerSchema>) => {
    try {
        const validated = createInvitationServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { email, organizationId } = validated.data;

        const userMember = await prisma.member.findFirst({ where: { userId: session.userId, organizationId, role: { in: ['OWNER'] } } });
        if (!userMember) {
            return { success: false, message: 'Error permission' };
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { Members: { select: { organizationId: true } }, id: true, Invitations: { select: { organizationId: true, status: true } } },
        });

        if (!user) {
            return { success: false, message: `Error couldn't find user with email ${email}` };
        }

        if (user.Members.some((e) => e.organizationId === organizationId)) {
            return { success: false, message: `Error ${email} is already a member of this organization` };
        }

        if (user.Invitations.find((e) => e.organizationId === organizationId && e.status === 'SENT')) {
            return { success: false, message: `Error Invitation was already sent to ${email}` };
        }

        const res = await prisma.invitation.create({
            data: {
                status: 'SENT',
                organizationId,
                userId: user.id,
            },
        });

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error something went wrong - createInvitation' };
    }
};

export const updateInvitationStatus = async (data: z.infer<typeof updateInvitationStatusServerSchema>) => {
    try {
        const validated = updateInvitationStatusServerSchema.safeParse(data);
        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();

        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { invitationId, status } = validated.data;

        const res = await prisma.invitation.update({
            where: {
                id: invitationId,
                status: 'SENT',
                ...(status === 'CANCELED'
                    ? { Organization: { Members: { some: { userId: session.userId, role: { in: ['OWNER'] } } } } }
                    : { userId: session.userId }),
            },
            data: {
                status,
                ...(status === 'ACCEPTED' && { Organization: { update: { Members: { create: { role: 'EMPLOYEE', userId: session.userId } } } } }),
            },
        });

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error something went wrong - updateInvitationStatus' };
    }
};
