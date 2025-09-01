import z from 'zod';

export const startTimeTrackerSchema = z.object({
    name: z.string().optional(),
    projectId: z.string().nullish(),
});

export const startTimeTrackerServerSchema = z.object({
    name: z.string().optional(),
    projectId: z.string().nullish(),
    organizationId: z.string(),
    memberId: z.string(),
});

export const manualTimeEntryServerSchema = z.object({
    name: z.string().optional(),
    start: z.date(),
    end: z.date(),
    projectId: z.string().optional(),
    organizationId: z.string(),
    memberId: z.string(),
});

export const manualTimeEntrySchema = z.object({
    startDate: z.date(),
    endDate: z.date(),
    startTime: z.string(),
    endTime: z.string(),
    name: z.string().optional(),
    projectId: z.string().optional(),
});
