'use server';

import bcrypt from 'bcrypt';
import { action } from '.';
import { deleteFile } from '../minio';
import { prisma } from '../prisma';
import { deleteOrgSchemaS, upsertOrgSchemaS } from '../zod/organization-schema';

export const upsertOrg = action(upsertOrgSchemaS, async (validated, session) => {
    const { name, currency, organizationId, roundUpMinutesThreshold, weekStart } = validated;
    const { userId } = session;
    try {
        let res;
        if (organizationId) {
            res = await prisma.organization.update({
                where: { id: organizationId, Members: { some: { userId, role: { in: ['MANAGER', 'OWNER'] } } } },
                data: { currency, name, roundUpMinutesThreshold, weekStart },
            });
        } else {
            res = await prisma.organization.create({
                data: {
                    currency: currency || 'EUR',
                    name: name || `${session.name}'s organization`,
                    Members: { create: { role: 'OWNER', userId } },
                    roundUpMinutesThreshold,
                    weekStart,
                },
            });
        }

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error - upsertOrg' };
    }
});

export const deleteOrg = action(deleteOrgSchemaS, async ({ organizationId, password }, { userId }) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });

        if (!user) return { success: false, message: 'Error user not found' };
        if (!(await bcrypt.compare(password, user?.password))) return { success: false, message: 'Error password incorrect' };

        await prisma.organization.delete({ where: { id: organizationId, Members: { some: { userId, role: 'OWNER' } } } });

        const fileName = `organization/${organizationId}/logo.png`;
        await deleteFile({ bucket: 'main', fileName });

        return { success: true };
    } catch {
        return { success: false, message: 'Error - deleteOrg' };
    }
});
