import { MEMBER_ROLE } from '@prisma/client';
import z from 'zod';

export const updateHourlyRateSchema = z.object({
    hourlyRate: z.coerce.number(),
});

export const updateRoleSchema = z.object({
    role: z.nativeEnum(MEMBER_ROLE),
});
