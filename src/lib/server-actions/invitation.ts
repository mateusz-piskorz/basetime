'use server';

import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { createInvitationSchema } from '../zod/invitation-schema';

export const createInvitation = async ({ data, organizationId }: { data: z.infer<typeof createInvitationSchema>; organizationId: string }) => {
    try {
        const validated = createInvitationSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { email } = validated.data;

        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, Invitations: { select: { organizationId: true, status: true } } },
        });

        if (!user) {
            return { success: false, message: `Error: couldn't find user with email ${email}` };
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
    } catch (e) {
        console.log(e);
        return { success: false, message: 'Error something went wrong - acceptInvitation' };
    }
};

export const rejectInvitation = async ({ invitationId }: { invitationId: string }) => {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        await prisma.invitation.update({ where: { id: invitationId }, data: { status: 'REJECTED' } });
        return { success: true };
    } catch (e) {
        console.log(e);
        return { success: false, message: 'Error something went wrong - rejectInvitation' };
    }
};

export const deleteInvitation = async ({ invitationId }: { invitationId: string }) => {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        await prisma.invitation.delete({ where: { id: invitationId } });
        return { success: true };
    } catch (e) {
        console.log(e);
        return { success: false, message: 'Error something went wrong - deleteInvitation' };
    }
};
