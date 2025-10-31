'use server';

import { prisma } from '../prisma';
import { removeMemberSchemaS, updateMemberSchemaS } from '../zod/member-schema';
import { action } from './_utils';

export const updateMember = action(updateMemberSchemaS, async ({ memberId, hourlyRate, projectIds, role }, { userId }) => {
    try {
        const member = await prisma.member.update({
            where: {
                id: memberId,
                ...(role !== 'OWNER' && { role: { not: 'OWNER' } }),
                Organization: { Members: { some: { role: { in: ['MANAGER', 'OWNER'] }, User: { id: userId } } } },
            },
            data: {
                ...(role && role !== 'OWNER' && { role }),
                ...(hourlyRate && { HourlyRates: { create: { value: hourlyRate } } }),
                Projects: { set: [], connect: projectIds?.map((id) => ({ id })) },
            },
        });

        return { success: true, data: member };
    } catch {
        return { success: false, message: 'Error - updateMember' };
    }
});

export const removeMember = action(removeMemberSchemaS, async ({ memberId }, { userId }) => {
    try {
        await prisma.member.delete({
            where: {
                id: memberId,
                role: { not: 'OWNER' },
                Organization: { Members: { some: { role: { in: ['MANAGER', 'OWNER'] }, User: { id: userId } } } },
            },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error - removeMember' };
    }
});
