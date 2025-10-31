import { INVITATION_STATUS } from '@prisma/client';
import z from 'zod';

export const createInvSchema = z.object({ email: z.string().email() });
export const createInvSchemaS = z.object({ email: z.string().email(), orgId: z.string() });
export const updateInvSchemaS = z.object({ invitationId: z.string().nonempty(), status: z.nativeEnum(INVITATION_STATUS) });
