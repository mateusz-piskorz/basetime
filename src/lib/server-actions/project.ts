'use server';

import { MEMBER_ROLE } from '@prisma/client';
import { action } from '.';
import { prisma } from '../prisma';
import { createProjectSchemaS, deleteProjectSchemaS } from '../zod/project-schema';

export const upsertProject = action(createProjectSchemaS, async (validated, session) => {
    try {
        const { memberIds, name, estimatedMinutes, color, organizationId, projectId } = validated;

        const data = {
            Organization: {
                connect: {
                    id: organizationId,
                    Members: { some: { userId: session.userId, role: { in: ['MANAGER', 'OWNER'] as MEMBER_ROLE[] } } },
                },
            },
            Members: { connect: memberIds?.map((id) => ({ id })) },
            estimatedMinutes,
        };

        const res = await prisma.project.upsert({
            where: { id: projectId || '' },
            create: {
                name: name || `${session.name}'s project`,
                color: color || 'GRAY',
                ...data,
            },
            update: {
                name,
                color,
                ...data,
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
