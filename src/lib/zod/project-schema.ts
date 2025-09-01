import { PROJECT_COLOR } from '@prisma/client';
import z from 'zod';

export const createProjectSchema = z.object({
    name: z.string().nonempty(),
    color: z.nativeEnum(PROJECT_COLOR),
    memberIds: z.array(z.string()).optional(),
    estimatedDuration: z.string().optional(),
});

export const createProjectServerSchema = z.object({
    name: z.string().nonempty(),
    color: z.nativeEnum(PROJECT_COLOR),
    memberIds: z.array(z.string()).optional(),
    estimatedMinutes: z.number().nullable(),
});
