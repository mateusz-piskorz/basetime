import { CURRENCY } from '@prisma/client';
import z from 'zod';

export const upsertOrganizationSchema = z.object({
    name: z.string().nonempty("Name can't be empty"),
    currency: z.nativeEnum(CURRENCY),
});

export const deleteOrganizationSchema = z.object({
    password: z.string().nonempty("Password can't be empty"),
});
