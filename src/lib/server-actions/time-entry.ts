'use server';

import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { manualTimeEntryServerSchema, startTimeTrackerServerSchema } from '../zod/time-entry-schema';

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

export const stopTimeTracker = async ({ timeEntryId }: { timeEntryId: string }) => {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        await prisma.timeEntry.update({ where: { id: timeEntryId }, data: { end: new Date() } });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - stopTimeTracker' };
    }
};

export const removeTimeEntry = async ({ timeEntryId }: { timeEntryId: string }) => {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        await prisma.timeEntry.delete({ where: { id: timeEntryId } });

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

        const { name, projectId, memberId, organizationId, end, start } = validated.data;

        await prisma.timeEntry.create({
            data: { start, end, memberId, name: name || 'unnamed time entry', organizationId, projectId },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - manualTimeEntry' };
    }
};
