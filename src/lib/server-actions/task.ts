'use server';

import { prisma } from '../prisma';
import { createTaskSchemaS, deleteTaskSchemaS, upsertTaskSchemaS } from '../zod/task-schema';
import { action } from './_utils';

// only create task is done

export const createTask = action(
    createTaskSchemaS,
    async ({ assignedMemberId, columnId, name, orgId, projectId, description, estimatedMinutes }, { userId }) => {
        try {
            await prisma.$transaction(async (tx) => {
                const firstInColumn = await tx.task.findFirst({
                    where: { projectId, columnId, organizationId: orgId, taskAboveId: null },
                });

                await tx.task.create({
                    data: {
                        name,
                        description,
                        estimatedMinutes,
                        Organization: { connect: { id: orgId, Members: { some: { userId } } } },
                        Project: { connect: { id: projectId } },
                        ...(assignedMemberId && { Assigned: { connect: { id: assignedMemberId } } }),
                        ...(columnId && { Column: { connect: { id: columnId } } }),
                        ...(firstInColumn && { TaskBelow: { connect: { id: firstInColumn.id, updatedAt: firstInColumn.updatedAt } } }),
                    },
                });
            });

            return { success: true };
        } catch {
            return { success: false, message: 'Error - createTask' };
        }
    },
);
export const upsertTask = action(upsertTaskSchemaS, async (validated, { userId }) => {
    try {
        const { assignedMemberId, name, orgId, projectId, description, estimatedMinutes, taskId } = validated;

        const res = await prisma.task.upsert({
            where: { id: taskId || '' },
            create: {
                name,
                description,
                estimatedMinutes,
                Project: { connect: { id: projectId } },
                ...(assignedMemberId && { Assigned: { connect: { id: assignedMemberId } } }),
                Organization: { connect: { id: orgId, Members: { some: { userId, role: { in: ['OWNER', 'MANAGER'] } } } } },
            },
            update: {
                name,
                description,
                estimatedMinutes,
                Project: { connect: { id: projectId } },
                ...(assignedMemberId ? { Assigned: { connect: { id: assignedMemberId } } } : { Assigned: { disconnect: true } }),
                Organization: { connect: { id: orgId, Members: { some: { userId, role: { in: ['OWNER', 'MANAGER'] } } } } },
            },
        });

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error - upsertTask' };
    }
});

export const deleteTask = action(deleteTaskSchemaS, async ({ taskId }, { userId }) => {
    try {
        await prisma.task.delete({
            where: {
                id: taskId,
                Organization: { Members: { some: { userId, role: { in: ['MANAGER', 'OWNER'] } } } },
            },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error - deleteTask' };
    }
});
