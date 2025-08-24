'use server';

import { prisma } from '@/lib/prisma';

import { formSchema } from '@/lib/zod/my-schema';
import z from 'zod';

type Inputs = z.infer<typeof formSchema>;

export const createUser = async (data: Inputs) => {
    try {
        const validated = formSchema.safeParse(data);

        if (validated.error) {
            return { success: false, data: null };
        }

        const res = await prisma.user.create({ data: validated.data });

        return { success: true, data: res };
    } catch {
        return { success: false, data: null };
    }
};
