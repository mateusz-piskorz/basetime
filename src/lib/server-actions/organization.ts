'use server';

import bcrypt from 'bcrypt';
import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { deleteOrganizationServerSchema, upsertOrganizationServerSchema } from '../zod/organization-schema';

export const upsertOrganization = async (data: z.infer<typeof upsertOrganizationServerSchema>) => {
    try {
        const session = await getSession();

        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const validated = upsertOrganizationServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const { currency, name, organizationId } = validated.data;

        let res;
        if (organizationId) {
            res = await prisma.organization.update({
                where: { id: organizationId, Members: { some: { userId: session.userId, role: { in: ['MANAGER', 'OWNER'] } } } },
                data: { currency, name },
            });
        } else {
            res = await prisma.organization.create({
                data: {
                    currency: currency || 'EUR',
                    name: name || `${session.name}'s organization`,
                    Members: { create: { role: 'OWNER', userId: session.userId } },
                },
            });
        }

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error something went wrong - createOrganization' };
    }
};

export const deleteOrganization = async (data: z.infer<typeof deleteOrganizationServerSchema>) => {
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
            where: { id: session.userId },
            select: { password: true },
        });

        if (!user) {
            return { success: false, message: 'Error user not found' };
        }

        if (!(await bcrypt.compare(password, user?.password))) {
            return { success: false, message: 'Error password incorrect' };
        }

        await prisma.organization.delete({ where: { id: organizationId, Members: { some: { userId: session.userId, role: 'OWNER' } } } });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - deleteOrganization' };
    }
};
