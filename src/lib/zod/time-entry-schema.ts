import z from 'zod';

export const startTimerSchema = z.object({
    name: z.string().optional(),
    projectId: z.string().nullish(),
});

export const startTimerSchemaS = z.object({
    name: z.string().optional(),
    projectId: z.string().nullish(),
    organizationId: z.string(),
    memberId: z.string(),
});

export const manualTimeEntrySchemaS = z.object({
    timeEntryId: z.string().optional(),
    name: z.string().optional(),
    start: z.date(),
    end: z.date(),
    projectId: z.string().optional(),
    organizationId: z.string(),
});

export const manualTimeEntrySchema = z.object({
    duration: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    startTime: z.string(),
    endTime: z.string(),
    name: z.string().optional(),
    projectId: z.string().optional(),
});

export const stopTimerSchemaS = z.object({ timeEntryId: z.string().nonempty() });

export const removeTimeEntriesSchemaS = z.object({ timeEntryIds: z.array(z.string()) });
