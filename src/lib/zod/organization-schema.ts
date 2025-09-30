import { CURRENCY, WEEK_START } from '@prisma/client';
import z from 'zod';

export const upsertOrgSchema = z.object({
    name: z.string().nonempty(),
    currency: z.nativeEnum(CURRENCY).optional(),
    weekStart: z.nativeEnum(WEEK_START).optional(),
    roundUpMinutesThreshold: z.coerce
        .number()
        .optional()
        .refine((val) => val === undefined || (val >= 0 && val <= 60), { message: 'Value must be between 0 and 60' }),
});

export const upsertOrgSchemaS = z.object({
    organizationId: z.string().optional(),
    name: z.string().nonempty(),
    currency: z.nativeEnum(CURRENCY).optional(),
    weekStart: z.nativeEnum(WEEK_START).optional(),
    roundUpMinutesThreshold: z
        .number()
        .optional()
        .refine((val) => val === undefined || (val >= 0 && val <= 60), { message: 'Value must be between 0 and 60' }),
});

export const deleteOrgSchema = z.object({ password: z.string().nonempty("Password can't be empty") });
export const deleteOrgSchemaS = z.object({
    organizationId: z.string().nonempty(),
    password: z.string().nonempty("Password can't be empty"),
});
