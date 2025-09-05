'use server';

import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import {
    manualTimeEntryServerSchema,
    removeTimeEntriesServerSchema,
    startTimeTrackerServerSchema,
    stopTimeTrackerServerSchema,
} from '../zod/time-entry-schema';

export const startTimeTracker = async ({ data }: { data: z.infer<typeof startTimeTrackerServerSchema> }) => {
    try {
        const validated = startTimeTrackerServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { name, projectId, memberId, organizationId } = validated.data;

        await prisma.timeEntry.create({
            data: { start: new Date(), memberId, name: name || 'unnamed time entry', organizationId, projectId },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - startTimeTracker' };
    }
};

export const stopTimeTracker = async ({ data }: { data: z.infer<typeof stopTimeTrackerServerSchema> }) => {
    try {
        const validated = stopTimeTrackerServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        await prisma.timeEntry.update({ where: { id: validated.data.timeEntryId }, data: { end: new Date() } });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - stopTimeTracker' };
    }
};

export const removeTimeEntries = async ({ data }: { data: z.infer<typeof removeTimeEntriesServerSchema> }) => {
    try {
        const validated = removeTimeEntriesServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        await prisma.timeEntry.deleteMany({ where: { id: { in: validated.data.timeEntryIds } } });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - removeTimeEntry' };
    }
};

export const manualTimeEntry = async ({ data }: { data: z.infer<typeof manualTimeEntryServerSchema> }) => {
    try {
        const validated = manualTimeEntryServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { name, projectId, memberId, organizationId, end, start, timeEntryId } = validated.data;

        await prisma.timeEntry.upsert({
            create: { start, end, memberId, name: name || 'unnamed time entry', organizationId, projectId },
            update: { start, end, memberId, name: name || 'unnamed time entry', organizationId, projectId },
            where: { id: timeEntryId || '' },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - manualTimeEntry' };
    }
};
