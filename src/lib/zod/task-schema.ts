import { TASK_PRIORITY } from '@prisma/client';
import z from 'zod';

export const upsertTaskSchema = z.object({
    name: z.string().nonempty(),
    projectId: z.string().nonempty(),
    priority: z.nativeEnum(TASK_PRIORITY),
    description: z.string().nullish(),
    assignedMemberId: z.string().nullable(),
    ETA: z.string().nullish(),
    kanbanColumnId: z.string().nullable(),
});

export const updateTaskDetailsSchema = z.object({
    projectId: z.string().nonempty(),
    priority: z.nativeEnum(TASK_PRIORITY),
    assignedMemberId: z.string().nullable(),
    ETA: z.string().nullish(),
    kanbanColumnId: z.string().nullable(),
});

export const createTaskSchemaS = z.object({
    orgId: z.string().nonempty(),
    projectId: z.string().nonempty(),
    name: z.string().nonempty(),
    kanbanColumnId: z.string().nullable(),
    priority: z.nativeEnum(TASK_PRIORITY),
    description: z.string().nullish(),
    assignedMemberId: z.string().nullable(),
    estimatedMinutes: z.number().nullish(),
});

export const updateTaskSchemaS = z.object({
    taskId: z.string().nonempty(),
    projectId: z.string().optional(),
    name: z.string().optional(),
    kanbanColumnId: z.string().nullish(),
    priority: z.nativeEnum(TASK_PRIORITY).optional(),
    description: z.string().nullish(),
    assignedMemberId: z.string().nullish(),
    estimatedMinutes: z.number().nullish(),
});

export const moveTaskOnKanbanSchemaS = z.object({
    taskId: z.string().nonempty(),
    kanbanColumnId: z.string().nonempty(),
    tasksOrder: z.array(z.string()),
});

export const deleteTaskSchemaS = z.object({
    taskId: z.string().nonempty(),
});

export const createTaskCommentSchemaS = z.object({
    taskId: z.string().nonempty(),
    content: z.string().nonempty(),
});

export const updateTaskCommentSchemaS = z.object({
    taskCommentId: z.string().nonempty(),
    content: z.string().nonempty(),
});
