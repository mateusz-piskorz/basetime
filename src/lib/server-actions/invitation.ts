'use server';

import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import {
    acceptInvitationServerSchema,
    cancelInvitationServerSchema,
    createInvitationServerSchema,
    rejectInvitationServerSchema,
} from '../zod/invitation-schema';

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

export const cancelInvitation = async (data: z.infer<typeof cancelInvitationServerSchema>) => {
    try {
        const validated = cancelInvitationServerSchema.safeParse(data);
        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const res = await prisma.invitation.update({
            where: {
                id: validated.data.invitationId,
                status: { in: ['SENT'] },
                Organization: { Members: { some: { userId: session.userId, role: { in: ['OWNER'] } } } },
            },
            data: { status: 'CANCELED' },
        });

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error something went wrong - cancelInvitation' };
    }
};

export const acceptInvitation = async (data: z.infer<typeof acceptInvitationServerSchema>) => {
    try {
        const validated = acceptInvitationServerSchema.safeParse(data);
        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { invitationId, organizationId } = validated.data;

        const res = await prisma.organization.update({
            where: { id: organizationId, Invitations: { some: { userId: session.userId, id: invitationId } } },
            data: {
                Members: { create: { role: 'EMPLOYEE', userId: session.userId } },
                Invitations: { update: { data: { status: 'ACCEPTED' }, where: { id: invitationId } } },
            },
            select: { Invitations: { where: { userId: session.userId, id: invitationId } } },
        });

        return { success: true, data: res.Invitations[0] };
    } catch {
        return { success: false, message: 'Error something went wrong - acceptInvitation' };
    }
};

export const rejectInvitation = async (data: z.infer<typeof rejectInvitationServerSchema>) => {
    try {
        const validated = rejectInvitationServerSchema.safeParse(data);
        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();

        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { invitationId } = validated.data;

        const res = await prisma.invitation.update({ where: { id: invitationId, userId: session.userId }, data: { status: 'REJECTED' } });

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error something went wrong - rejectInvitation' };
    }
};
