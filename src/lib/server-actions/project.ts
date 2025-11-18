'use server';

import { prisma } from '../prisma';
import { createProjectSchemaS, deleteProjectSchemaS } from '../zod/project-schema';
import { action } from './_utils';

export const upsertProject = action(createProjectSchemaS, async (validated, session) => {
    try {
        const { memberIds, name, estimatedMinutes, color, orgId, projectId, shortName } = validated;

        if (await prisma.project.findFirst({ where: { organizationId: orgId, shortName, id: { not: projectId } } })) {
            return { success: false, message: `short name ${shortName} already exists in organization` };
        }

        const res = await prisma.project.upsert({
            where: { id: projectId || '' },
            create: {
                name: name || `${session.name}'s project`,
                shortName,
                color: color || 'GRAY',
                Organization: {
                    connect: {
                        id: orgId,
                        Members: {
                            some: {
                                userId: session.userId,
                                role: { in: ['MANAGER', 'OWNER'] },
                            },
                        },
                    },
                },
                Members: { connect: memberIds?.map((id) => ({ id })) },
                estimatedMinutes,
            },
            update: {
                shortName,
                name,
                color,
                Organization: {
                    connect: {
                        id: orgId,
                        Members: {
                            some: {
                                userId: session.userId,
                                role: { in: ['MANAGER', 'OWNER'] },
                            },
                        },
                    },
                },
                Members: { connect: memberIds?.map((id) => ({ id })) },
                estimatedMinutes,
            },
        });

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error - upsertProject' };
    }
});

export const deleteProject = action(deleteProjectSchemaS, async ({ projectId }, { userId }) => {
    try {
        await prisma.project.delete({
            where: {
                id: projectId,
                Organization: { Members: { some: { userId, role: { in: ['MANAGER', 'OWNER'] } } } },
            },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error - deleteProject' };
    }
});
