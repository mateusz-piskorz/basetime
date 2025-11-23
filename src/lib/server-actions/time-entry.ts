'use server';

import { prisma } from '../prisma';
import { manualTimeEntrySchemaS, removeTimeEntriesSchemaS, toggleTimerSchemaS } from '../zod/time-entry-schema';
import { action } from './_utils';

export const toggleTimer = action(toggleTimerSchemaS, async ({ orgId, name, projectId, taskId }, { userId }) => {
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
            data: { memberId: member.id, start: new Date(), name: name || 'unnamed time entry', organizationId: orgId, projectId, taskId },
        });
        return { success: true, message: 'Timer started successfully' };
    } catch (e) {
        console.log(e);
        return { success: false, message: 'Error - toggleTimer' };
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
        const { name, projectId, orgId, end, start, timeEntryId, taskId } = validated;
        const member = await prisma.member.findFirst({ where: { userId, organizationId: orgId } });

        if (!member) return { success: false, message: 'Error member not found' };

        let res;
        if (timeEntryId) {
            res = await prisma.timeEntry.update({
                data: { start, end, name: name || 'unnamed time entry', organizationId: orgId, projectId, taskId },
                where: {
                    id: timeEntryId,
                    OR: [{ Member: { userId } }, { Organization: { Members: { some: { userId, role: { in: ['OWNER', 'MANAGER'] } } } } }],
                },
            });
        } else {
            res = await prisma.timeEntry.create({
                data: {
                    start: start as Date,
                    end,
                    memberId: member.id,
                    name: name || 'unnamed time entry',
                    organizationId: orgId as string,
                    projectId,
                    taskId,
                },
            });
        }

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error - manualTimeEntry' };
    }
});
