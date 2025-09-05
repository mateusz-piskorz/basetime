'use server';

import bcrypt from 'bcrypt';
import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { deleteOrganizationServerSchema, upsertOrganizationServerSchema } from '../zod/organization-schema';

export const upsertOrganization = async ({ data }: { data: z.infer<typeof upsertOrganizationServerSchema> }) => {
    try {
        const validated = upsertOrganizationServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { currency, name, organizationId } = validated.data;

        if (organizationId) {
            await prisma.organization.update({ where: { id: organizationId }, data: { currency, name } });
        } else {
            await prisma.organization.create({ data: { currency, name, Members: { create: { role: 'OWNER', userId: session.id } } } });
        }

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - createOrganization' };
    }
};

export const deleteOrganization = async ({ data }: { data: z.infer<typeof deleteOrganizationServerSchema> }) => {
    try {
        const validated = deleteOrganizationServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { password, organizationId } = validated.data;

        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: { password: true },
        });

        if (!user) {
            return { success: false, message: 'Error user not found' };
        }

        if (!(await bcrypt.compare(password, user?.password))) {
            return { success: false, message: 'Error password incorrect' };
        }

        await prisma.organization.delete({ where: { id: organizationId, Members: { some: { userId: session.id, role: 'OWNER' } } } });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - deleteOrganization' };
    }
};
