import { MEMBER_ROLE } from '@prisma/client';
import z from 'zod';

export const updateMemberSchema = z.object({
    role: z.nativeEnum(MEMBER_ROLE),
    hourlyRate: z.coerce.number().optional(),
    projectIds: z.array(z.string()).optional(),
});

export const updateMemberSchemaS = z.object({
    memberId: z.string().nonempty(),
    role: z.nativeEnum(MEMBER_ROLE).optional(),
    hourlyRate: z.coerce.number().optional(),
    projectIds: z.array(z.string()).optional(),
});

export const removeMemberSchemaS = z.object({ memberId: z.string().nonempty() });
