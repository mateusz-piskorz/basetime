import z from 'zod';

export const upsertTaskSchema = z.object({
    name: z.string().nonempty(),
    projectId: z.string().nonempty(),
    description: z.string().nullish(),
    assignedMemberId: z.string().nullable(),
    duration: z.string().nullish(),
    columnId: z.string().nullable(),
});

export const createTaskSchemaS = z.object({
    orgId: z.string().nonempty(),
    projectId: z.string().nonempty(),
    name: z.string().nonempty(),
    columnId: z.string().nullable(),
    description: z.string().nullish(),
    assignedMemberId: z.string().nullable(),
    estimatedMinutes: z.number().nullish(),
});

export const upsertTaskSchemaS = z.object({
    orgId: z.string().nonempty(),
    projectId: z.string().nonempty(),
    taskId: z.string().optional(),
    name: z.string().nonempty(),
    description: z.string().nullish(),
    assignedMemberId: z.string().nullable(),
    estimatedMinutes: z.number().nullish(),
});

export const deleteTaskSchemaS = z.object({
    taskId: z.string().nonempty(),
});
