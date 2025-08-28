import { CURRENCY } from '@prisma/client';
import z from 'zod';

export const createOrganizationSchema = z.object({
    name: z.string().nonempty("Name can't be empty"),
    currency: z.enum(CURRENCY),
});
