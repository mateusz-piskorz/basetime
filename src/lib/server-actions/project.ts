'use server';

import z from 'zod';
import { action } from '.';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { createProjectSchemaS, deleteProjectServerSchema } from '../zod/project-schema';

export const upsertProject = action(createProjectSchemaS, async (validated, session) => {
    try {
        const { memberIds, name, estimatedMinutes, color, organizationId, projectId } = validated;
        const { userId } = session;
        let res;
        if (projectId) {
            res = await prisma.project.update({
                where: { id: projectId },
                data: {
                    name,
                    color,
                    estimatedMinutes,
                    Members: { connect: memberIds?.map((id) => ({ id })) },
                    Organization: {
                        connect: { id: organizationId, Members: { some: { userId, role: { in: ['MANAGER', 'OWNER'] } } } },
                    },
                },
            });
        } else {
            res = await prisma.project.create({
                data: {
                    name: name || `${session.name}'s project`,
                    color: color || 'GRAY',
                    estimatedMinutes,
                    Members: { connect: memberIds?.map((id) => ({ id })) },
                    Organization: {
                        connect: { id: organizationId, Members: { some: { userId, role: { in: ['MANAGER', 'OWNER'] } } } },
                    },
                },
            });
        }

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error something went wrong - upsertProject' };
    }
});

export const deleteProject = async (data: z.infer<typeof deleteProjectServerSchema>) => {
    try {
        const validated = deleteProjectServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        await prisma.project.delete({
            where: {
                id: validated.data.projectId,
                Organization: { Members: { some: { userId: session.userId, role: { in: ['MANAGER', 'OWNER'] } } } },
            },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - deleteProject' };
    }
};
