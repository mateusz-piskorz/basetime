import { INVITATION_STATUS } from '@prisma/client';
import z from 'zod';

export const createInvitationSchema = z.object({
    email: z.string().email(),
});

export const createInvitationServerSchema = z.object({
    email: z.string().email(),
    organizationId: z.string(),
});

export const cancelInvitationServerSchema = z.object({
    invitationId: z.string().nonempty(),
});

export const acceptInvitationServerSchema = z.object({
    invitationId: z.string().nonempty(),
});

export const rejectInvitationServerSchema = z.object({
    invitationId: z.string().nonempty(),
});

export const updateInvitationStatusServerSchema = z.object({
    invitationId: z.string().nonempty(),
    status: z.nativeEnum(INVITATION_STATUS),
});
