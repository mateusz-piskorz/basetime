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

export const startTimeTracker = async (data: z.infer<typeof startTimeTrackerServerSchema>) => {
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

        const res = await prisma.timeEntry.create({
            data: { start: new Date(), memberId, name: name || 'unnamed time entry', organizationId, projectId },
        });

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error something went wrong - startTimeTracker' };
    }
};

export const stopTimeTracker = async (data: z.infer<typeof stopTimeTrackerServerSchema>) => {
    try {
        const validated = stopTimeTrackerServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        await prisma.timeEntry.update({ where: { id: validated.data.timeEntryId, end: null }, data: { end: new Date() } });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - stopTimeTracker' };
    }
};

export const removeTimeEntries = async (data: z.infer<typeof removeTimeEntriesServerSchema>) => {
    try {
        const validated = removeTimeEntriesServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { count } = await prisma.timeEntry.deleteMany({
            where: {
                id: { in: validated.data.timeEntryIds },
                OR: [
                    { Member: { userId: session.userId } },
                    { Organization: { Members: { some: { userId: session.userId, role: { in: ['OWNER', 'MANAGER'] } } } } },
                ],
            },
        });

        return { success: Boolean(count) };
    } catch {
        return { success: false, message: 'Error something went wrong - removeTimeEntry' };
    }
};

export const manualTimeEntry = async (data: z.infer<typeof manualTimeEntryServerSchema>) => {
    try {
        const validated = manualTimeEntryServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { name, projectId, organizationId, end, start, timeEntryId } = validated.data;
        const member = await prisma.member.findFirst({ where: { userId: session.userId, organizationId } });

        if (!member) {
            return { success: false, message: 'Error member not found' };
        }

        let res;
        if (timeEntryId) {
            res = await prisma.timeEntry.update({
                data: { start, end, memberId: member.id, name: name || 'unnamed time entry', organizationId, projectId },
                where: {
                    id: timeEntryId,
                    OR: [
                        { Member: { userId: session.userId } },
                        { Organization: { Members: { some: { userId: session.userId, role: { in: ['OWNER', 'MANAGER'] } } } } },
                    ],
                },
            });
        } else {
            res = await prisma.timeEntry.create({
                data: { start, end, memberId: member.id, name: name || 'unnamed time entry', organizationId, projectId },
            });
        }

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error something went wrong - manualTimeEntry' };
    }
};
