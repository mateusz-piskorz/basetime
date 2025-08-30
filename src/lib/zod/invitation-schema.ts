import z from 'zod';

export const createInvitationSchema = z.object({
    email: z.string().email(),
});
