'use server';

import z from 'zod';
import { prisma } from '../prisma';
import { verifySession } from '../session';
import { createOrganizationSchema } from '../zod/organization-schema';

export const createOrganization = async (data: z.infer<typeof createOrganizationSchema>) => {
    try {
        const validated = createOrganizationSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await verifySession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { currency, name } = validated.data;

        await prisma.organization.create({ data: { currency, name, Members: { create: { role: 'OWNER', userId: session.id } } } });

        return { success: true };
    } catch (error) {
        console.log(error);
        return { success: false, message: 'Error something went wrong - createOrganization' };
    }
};
