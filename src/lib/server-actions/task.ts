'use server';

import { prisma } from '../prisma';
import {
    createTaskCommentSchemaS,
    createTaskSchemaS,
    deleteTaskSchemaS,
    moveTaskOnKanbanSchemaS,
    updateTaskCommentSchemaS,
    updateTaskSchemaS,
} from '../zod/task-schema';
import { action } from './_utils';

export const createTask = action(
    createTaskSchemaS,
    async ({ assignedMemberId, kanbanColumnId, name, orgId, projectId, description, estimatedMinutes, priority }, { userId }) => {
        try {
            return await prisma.$transaction(async (prisma) => {
                const orgSeq = await prisma.organization.update({
                    where: { id: orgId, Members: { some: { userId } } },
                    data: { taskLastNumber: { increment: 1 } },
                });

                await prisma.task.create({
                    data: {
                        taskNumber: orgSeq.taskLastNumber,
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
                return { success: true } as const;
            });
        } catch {
            return { success: false, message: 'Error - createTask' };
        }
    },
);

export const updateTask = action(
    updateTaskSchemaS,
    async ({ assignedMemberId, kanbanColumnId, name, projectId, description, estimatedMinutes, priority, taskId }, { userId }) => {
        try {
            await prisma.task.update({
                where: { id: taskId, Organization: { Members: { some: { userId } } } },
                data: {
                    name,
                    description,
                    estimatedMinutes,
                    priority,
                    ...(projectId && { Project: { connect: { id: projectId } } }),
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

export const createTaskComment = action(createTaskCommentSchemaS, async ({ content, taskId }, { userId }) => {
    try {
        const member = await prisma.member.findFirst({ where: { userId, Organization: { Tasks: { some: { id: taskId } } } } });
        if (!member) return { success: false, message: 'Error - permission' };

        await prisma.taskComment.create({
            data: { taskId, content, authorId: member.id },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error - createTaskComment' };
    }
});

export const updateTaskComment = action(updateTaskCommentSchemaS, async ({ content, taskCommentId }, { userId }) => {
    try {
        await prisma.taskComment.update({
            where: { id: taskCommentId, Task: { Organization: { Members: { some: { userId } } } }, Author: { userId } },
            data: { content },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error - updateTaskComment' };
    }
});
