import z from 'zod';

export const upsertTaskSchema = z.object({
    name: z.string().nonempty(),
    projectId: z.string().nonempty(),
    description: z.string().nullish(),
    assignedMemberId: z.string().nullish(),
    duration: z.string().nullish(),
});

export const upsertTaskSchemaS = z.object({
    orgId: z.string().nonempty(),
    projectId: z.string().nonempty(),
    taskId: z.string().optional(),
    name: z.string().nonempty(),
    description: z.string().nullish(),
    assignedMemberId: z.string().nullish(),
    estimatedMinutes: z.number().nullish(),
});

export const deleteTaskSchemaS = z.object({
    taskId: z.string().nonempty(),
});
