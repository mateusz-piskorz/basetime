'use server';

import { prisma } from '../prisma';
import { manualTimeEntrySchemaS, removeTimeEntriesSchemaS, toggleTimerSchemaS } from '../zod/time-entry-schema';
import { action } from './_utils';

export const toggleTimer = action(toggleTimerSchemaS, async ({ orgId, name, projectId }, { userId }) => {
    try {
        const member = await prisma.member.findFirst({
            where: { organizationId: orgId, userId },
            include: { TimeEntries: { where: { end: null } } },
        });

        if (!member) return { success: false, message: 'Error - member not found' };

        // stop timer
        if (member.TimeEntries.length > 0) {
            await prisma.timeEntry.update({ where: { id: member.TimeEntries[0].id }, data: { end: new Date() } });
            return { success: true, message: 'Timer stopped successfully' };
        }

        // start timer
        await prisma.timeEntry.create({
            data: { memberId: member.id, start: new Date(), name: name || 'unnamed time entry', organizationId: orgId, projectId },
        });
        return { success: true, message: 'Timer started successfully' };
    } catch {
        return { success: false, message: 'Error - startTimer' };
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
        const { name, projectId, orgId, end, start, timeEntryId } = validated;
        const member = await prisma.member.findFirst({ where: { userId, organizationId: orgId } });

        if (!member) return { success: false, message: 'Error member not found' };

        let res;
        if (timeEntryId) {
            res = await prisma.timeEntry.update({
                data: { start, end, name: name || 'unnamed time entry', organizationId: orgId, projectId },
                where: {
                    id: timeEntryId,
                    OR: [{ Member: { userId } }, { Organization: { Members: { some: { userId, role: { in: ['OWNER', 'MANAGER'] } } } } }],
                },
            });
        } else {
            if (!start || !orgId) return { success: false, message: 'Error - start and orgId arg is required' };
            res = await prisma.timeEntry.create({
                data: { start, end, memberId: member.id, name: name || 'unnamed time entry', organizationId: orgId, projectId },
            });
        }

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error - manualTimeEntry' };
    }
});
