'use server';

import { action } from '.';
import { prisma } from '../prisma';
import { manualTimeEntrySchemaS, removeTimeEntriesSchemaS, startTimerSchemaS, stopTimerSchemaS } from '../zod/time-entry-schema';

// todo: check permission
export const startTimer = action(startTimerSchemaS, async ({ memberId, organizationId, name, projectId }) => {
    try {
        const res = await prisma.timeEntry.create({
            data: { start: new Date(), memberId, name: name || 'unnamed time entry', organizationId, projectId },
        });

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error - startTimer' };
    }
});

// todo: check permission
export const stopTimer = action(stopTimerSchemaS, async ({ timeEntryId }) => {
    try {
        await prisma.timeEntry.update({ where: { id: timeEntryId, end: null }, data: { end: new Date() } });

        return { success: true };
    } catch {
        return { success: false, message: 'Error - stopTimer' };
    }
});

export const removeTimeEntries = action(removeTimeEntriesSchemaS, async ({ timeEntryIds }, { userId }) => {
    try {
        const { count } = await prisma.timeEntry.deleteMany({
            where: {
                id: { in: timeEntryIds },
                OR: [{ Member: { userId } }, { Organization: { Members: { some: { userId, role: { in: ['OWNER', 'MANAGER'] } } } } }],
            },
        });

        return { success: Boolean(count) };
    } catch {
        return { success: false, message: 'Error - removeTimeEntry' };
    }
});

export const manualTimeEntry = action(manualTimeEntrySchemaS, async (validated, { userId }) => {
    try {
        const { name, projectId, organizationId, end, start, timeEntryId } = validated;
        const member = await prisma.member.findFirst({ where: { userId, organizationId } });

        if (!member) return { success: false, message: 'Error member not found' };

        let res;
        if (timeEntryId) {
            res = await prisma.timeEntry.update({
                data: { start, end, memberId: member.id, name: name || 'unnamed time entry', organizationId, projectId },
                where: {
                    id: timeEntryId,
                    OR: [{ Member: { userId } }, { Organization: { Members: { some: { userId, role: { in: ['OWNER', 'MANAGER'] } } } } }],
                },
            });
        } else {
            res = await prisma.timeEntry.create({
                data: { start, end, memberId: member.id, name: name || 'unnamed time entry', organizationId, projectId },
            });
        }

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error - manualTimeEntry' };
    }
});
