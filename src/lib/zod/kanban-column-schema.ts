import z from 'zod';

export const createKanbanColumnSchemaS = z.object({
    orgId: z.string().nonempty(),
    name: z.string().nonempty(),
    order: z.number().positive().min(0),
    color: z.string(),
});

export const updateKanbanColumnSchemaS = z.object({
    columnId: z.string().nonempty(),
    name: z.string().optional(),
    order: z.number().positive().min(0).optional(),
    color: z.string().optional(),
});

export const deleteKanbanColumnSchemaS = z.object({
    columnId: z.string().nonempty(),
});

export const upsertKanbanColumnSchema = z.object({
    name: z.string().nonempty(),
    order: z.number().positive().min(0),
    color: z.string(),
});
