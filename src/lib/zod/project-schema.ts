import { PROJECT_COLOR } from '@prisma/client';
import z from 'zod';

export const upsertProjectSchema = z.object({
    name: z.string().nonempty(),
    color: z.nativeEnum(PROJECT_COLOR),
    memberIds: z.array(z.string()).optional(),
    estimatedDuration: z.string().optional(),
});

export const createProjectServerSchema = z.object({
    projectId: z.string().optional(),
    organizationId: z.string(),
    name: z.string().nonempty(),
    color: z.nativeEnum(PROJECT_COLOR),
    memberIds: z.array(z.string()).optional(),
    estimatedMinutes: z.number().nullable(),
});
