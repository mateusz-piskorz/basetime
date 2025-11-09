import { prisma } from '../prisma';
import { deleteTaskSchemaS, upsertTaskSchemaS } from '../zod/task-schema';
import { action } from './_utils';

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
                Assigned: { connect: { id: assignedMemberId ?? undefined } },
                Organization: { connect: { id: orgId, Members: { some: { userId, role: { in: ['OWNER', 'MANAGER'] } } } } },
            },
            update: {
                name,
                description,
                estimatedMinutes,
                Project: { connect: { id: projectId } },
                Assigned: { connect: { id: assignedMemberId ?? undefined } },
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
