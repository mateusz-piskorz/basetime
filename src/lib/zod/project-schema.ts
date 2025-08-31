import z from 'zod';

export const createProjectSchema = z.object({
    name: z.string().nonempty(),
    memberIds: z.array(z.string()).optional(),
    estimatedDuration: z.string().optional(),
});

export const createProjectServerSchema = z.object({
    name: z.string().nonempty(),
    memberIds: z.array(z.string()).optional(),
    estimatedMinutes: z.number().nullable(),
});
