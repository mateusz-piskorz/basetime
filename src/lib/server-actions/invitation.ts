'use server';

import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { cancelInvitationServerSchema, createInvitationServerSchema } from '../zod/invitation-schema';

export const createInvitation = async ({ data }: { data: z.infer<typeof createInvitationServerSchema> }) => {
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

        const userMember = await prisma.member.findFirst({ where: { userId: session.id, organizationId, role: { in: ['MANAGER', 'OWNER'] } } });
        if (!userMember) {
            return { success: false, message: `Error: permission` };
        }

        const user = await prisma.user.findUnique({
            where: { email },
            select: { Members: { select: { organizationId: true } }, id: true, Invitations: { select: { organizationId: true, status: true } } },
        });

        if (!user) {
            return { success: false, message: `Error: couldn't find user with email ${email}` };
        }

        if (user.Members.some((e) => e.organizationId === organizationId)) {
            return { success: false, message: `Error: ${email} is already a member of this organization` };
        }

        if (user.Invitations.find((e) => e.organizationId === organizationId && e.status === 'SENT')) {
            return { success: false, message: `Error: Invitation was already sent to ${email}` };
        }

        await prisma.invitation.create({
            data: {
                status: 'SENT',
                organizationId,
                userId: user.id,
            },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - createInvitation' };
    }
};

export const cancelInvitation = async ({ data }: { data: z.infer<typeof cancelInvitationServerSchema> }) => {
    try {
        const validated = cancelInvitationServerSchema.safeParse(data);
        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        await prisma.invitation.update({
            where: {
                id: validated.data.invitationId,
                status: { in: ['SENT'] },
                Organization: { Members: { some: { userId: session.id, role: { in: ['MANAGER', 'OWNER'] } } } },
            },
            data: { status: 'CANCELED' },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - cancelInvitation' };
    }
};

// todo: check security
export const acceptInvitation = async ({ invitationId, organizationId }: { invitationId: string; organizationId: string }) => {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        await prisma.organization.update({
            where: { id: organizationId },
            data: {
                Members: { create: { role: 'EMPLOYEE', userId: session.id } },
                Invitations: { update: { data: { status: 'ACCEPTED' }, where: { id: invitationId } } },
            },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - acceptInvitation' };
    }
};

// todo: check security
export const rejectInvitation = async ({ invitationId }: { invitationId: string }) => {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        await prisma.invitation.update({ where: { id: invitationId }, data: { status: 'REJECTED' } });
        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - rejectInvitation' };
    }
};
