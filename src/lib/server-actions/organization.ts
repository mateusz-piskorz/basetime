'use server';

import bcrypt from 'bcrypt';
import { deleteFile, uploadFile } from '../minio';
import { prisma } from '../prisma';
import { deleteOrgSchemaS, updateOrgLogoSchema, upsertOrgSchemaS } from '../zod/organization-schema';
import { action, validateBase64 } from './_utils';

export const upsertOrg = action(upsertOrgSchemaS, async (validated, session) => {
    const { name, currency, organizationId, roundUpMinutesThreshold, weekStart, roundUpSecondsThreshold } = validated;
    const { userId } = session;
    try {
        let res;
        if (organizationId) {
            res = await prisma.organization.update({
                where: { id: organizationId, Members: { some: { userId, role: { in: ['MANAGER', 'OWNER'] } } } },
                data: { currency, name, roundUpMinutesThreshold, roundUpSecondsThreshold, weekStart },
            });
        } else {
            res = await prisma.organization.create({
                data: {
                    currency: currency || 'EUR',
                    name: name || `${session.name}'s organization`,
                    Members: { create: { role: 'OWNER', userId } },
                    taskLastNumber: 1,
                },
            });
            const project = await prisma.project.create({
                data: {
                    name: 'Example Project',
                    color: '#00B4D8',
                    organizationId: res.id,
                },
            });
            await prisma.kanbanColumn.create({
                data: {
                    organizationId: res.id,
                    name: 'Backlog',
                    order: 0,
                    color: '#00B4D8',
                    Tasks: {
                        create: {
                            organizationId: res.id,
                            name: 'Example Task',
                            priority: 'MEDIUM',
                            projectId: project.id,
                            taskNumber: res.taskLastNumber,
                        },
                    },
                },
            });
            await prisma.kanbanColumn.create({
                data: {
                    organizationId: res.id,
                    name: 'In Progress',
                    order: 1,
                    color: '#F5A623',
                },
            });
        }

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error - upsertOrg' };
    }
});

export const updateOrgLogo = action(updateOrgLogoSchema, async ({ logoBase64, orgId }, { userId }) => {
    const fileName = `organization/${orgId}/logo.png`;
    try {
        const organization = await prisma.organization.findUnique({
            where: { id: orgId, Members: { some: { userId: userId, role: 'OWNER' } } },
        });
        if (!organization) return { success: false, message: 'Error permissions' };

        if (logoBase64) {
            const buffer = await validateBase64({ base64: logoBase64, type: 'png', height: 276, width: 276 });
            if (!buffer) return { success: false, message: 'Error validating fields' };

            await uploadFile({ bucket: 'main', file: buffer, fileName, contentType: 'image/png' });
        } else {
            await deleteFile({ bucket: 'main', fileName });
        }

        return { success: true };
    } catch {
        return { success: false, message: 'Error - updateOrgLogo' };
    }
});

export const deleteOrg = action(deleteOrgSchemaS, async ({ orgId, password }, { userId }) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });

        if (!user) return { success: false, message: 'Error user not found' };
        if (!(await bcrypt.compare(password, user?.password))) return { success: false, message: 'Error password incorrect' };

        await prisma.organization.delete({ where: { id: orgId, Members: { some: { userId, role: 'OWNER' } } } });

        const fileName = `organization/${orgId}/logo.png`;
        await deleteFile({ bucket: 'main', fileName });

        return { success: true };
    } catch {
        return { success: false, message: 'Error - deleteOrg' };
    }
});
