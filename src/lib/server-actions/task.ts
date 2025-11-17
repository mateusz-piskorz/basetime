'use server';

import { prisma } from '../prisma';
import { createTaskSchemaS, deleteTaskSchemaS, moveTaskOnKanbanSchemaS, updateTaskSchemaS } from '../zod/task-schema';
import { action } from './_utils';

export const createTask = action(
    createTaskSchemaS,
    async ({ assignedMemberId, kanbanColumnId, name, orgId, projectId, description, estimatedMinutes, priority }, { userId }) => {
        try {
            await prisma.task.create({
                data: {
                    name,
                    description,
                    estimatedMinutes,
                    priority,
                    Organization: { connect: { id: orgId, Members: { some: { userId } } } },
                    Project: { connect: { id: projectId } },
                    ...(assignedMemberId && { Assigned: { connect: { id: assignedMemberId } } }),
                    ...(kanbanColumnId && { KanbanColumn: { connect: { id: kanbanColumnId } } }),
                },
            });
            return { success: true };
        } catch {
            return { success: false, message: 'Error - createTask' };
        }
    },
);

export const updateTask = action(
    updateTaskSchemaS,
    async ({ assignedMemberId, kanbanColumnId, name, orgId, projectId, description, estimatedMinutes, priority, taskId }, { userId }) => {
        try {
            await prisma.task.update({
                where: { id: taskId },
                data: {
                    name,
                    description,
                    estimatedMinutes,
                    priority,
                    Organization: { connect: { id: orgId, Members: { some: { userId } } } },
                    Project: { connect: { id: projectId } },
                    ...(assignedMemberId && { Assigned: { connect: { id: assignedMemberId } } }),
                    ...(kanbanColumnId && { KanbanColumn: { connect: { id: kanbanColumnId } } }),
                },
            });
            return { success: true };
        } catch {
            return { success: false, message: 'Error - updateTask' };
        }
    },
);

export const moveTaskOnKanban = action(moveTaskOnKanbanSchemaS, async ({ kanbanColumnId, taskId, tasksOrder }, { userId }) => {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.task.update({ where: { id: taskId, Organization: { Members: { some: { userId } } } }, data: { kanbanColumnId } });
            await tx.kanbanColumn.update({
                where: { id: kanbanColumnId, Organization: { Members: { some: { userId } } } },
                data: { TasksOrder: tasksOrder },
            });
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error - moveTaskOnKanban' };
    }
});

export const deleteTask = action(deleteTaskSchemaS, async ({ taskId }, { userId }) => {
    try {
        await prisma.task.delete({
            where: { id: taskId, Organization: { Members: { some: { userId } } } },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error - deleteTask' };
    }
});
