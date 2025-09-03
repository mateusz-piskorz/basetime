import { MEMBER_ROLE } from '@prisma/client';
import z from 'zod';

export const updateHourlyRateSchema = z.object({
    hourlyRate: z.coerce.number(),
});

export const updateRoleSchema = z.object({
    role: z.nativeEnum(MEMBER_ROLE).refine((val) => val !== 'OWNER', {
        message: 'OWNER role cannot be assigned.',
    }),
});

export const assignProjectsSchema = z.object({
    projectIds: z.array(z.string()).optional(),
});

export const updateMemberSchema = z.object({
    role: z.nativeEnum(MEMBER_ROLE),
    hourlyRate: z.coerce.number(),
    projectIds: z.array(z.string()).optional(),
});
