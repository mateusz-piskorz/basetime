import z from 'zod';

export const upsertProjectSchema = z.object({
    name: z.string().nonempty(),
    color: z.string().nonempty(),
    memberIds: z.array(z.string()).optional(),
    estimatedDuration: z.string().optional(),
});

export const createProjectSchemaS = z.object({
    projectId: z.string().optional(),
    orgId: z.string(),
    name: z.string().nonempty().optional(),
    color: z.string().optional(),
    memberIds: z.array(z.string()).optional(),
    estimatedMinutes: z.number().nullish(),
});

export const deleteProjectSchemaS = z.object({
    projectId: z.string().nonempty(),
});
