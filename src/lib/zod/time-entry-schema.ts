import z from 'zod';

export const startTimerSchema = z.object({
    name: z.string().optional(),
    projectId: z.string().nullish(),
});

export const toggleTimerSchemaS = z.object({
    orgId: z.string(),
    name: z.string().optional(),
    projectId: z.string().nullish(),
});

export const manualTimeEntrySchemaS = z
    .object({
        timeEntryId: z.string().optional(),
        name: z.string().optional(),
        start: z.date().optional(),
        end: z.date().optional(),
        projectId: z.string().optional(),
        orgId: z.string().optional(),
    })
    .refine((data) => data.timeEntryId || !!data.start, { message: 'start date is required', path: ['start'] })
    .refine((data) => data.timeEntryId || !!data.orgId, { message: 'orgId is required', path: ['orgId'] });

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
