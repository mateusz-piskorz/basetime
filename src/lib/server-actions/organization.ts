'use server';

import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { upsertOrganizationSchema } from '../zod/organization-schema';

export const upsertOrganization = async ({ data, organizationId }: { data: z.infer<typeof upsertOrganizationSchema>; organizationId?: string }) => {
    try {
        const validated = upsertOrganizationSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { currency, name } = validated.data;
        if (organizationId) {
            await prisma.organization.update({ where: { id: organizationId }, data: { currency, name } });
        } else {
            await prisma.organization.create({ data: { currency, name, Members: { create: { role: 'OWNER', userId: session.id } } } });
        }

        return { success: true };
    } catch (error) {
        console.log(error);
        return { success: false, message: 'Error something went wrong - createOrganization' };
    }
};
