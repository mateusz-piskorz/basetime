'use server';

import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { removeMemberServerSchema, updateMemberServerSchema } from '../zod/member-schema';

export const updateMember = async (data: z.infer<typeof updateMemberServerSchema>) => {
    try {
        const validated = updateMemberServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { role, hourlyRate, projectIds, memberId } = validated.data;

        const member = await prisma.member.update({
            where: {
                id: memberId,
                ...(role !== 'OWNER' && { role: { not: 'OWNER' } }),
                Organization: { Members: { some: { role: { in: ['MANAGER', 'OWNER'] }, User: { id: session.userId } } } },
            },
            data: {
                ...(role && role !== 'OWNER' && { role }),
                ...(hourlyRate && { HourlyRates: { create: { value: hourlyRate } } }),
                Projects: { set: [], connect: projectIds?.map((id) => ({ id })) },
            },
        });

        return { success: true, data: member };
    } catch {
        return { success: false, message: 'Error something went wrong - updateMember' };
    }
};

export const removeMember = async (data: z.infer<typeof removeMemberServerSchema>) => {
    try {
        const validated = removeMemberServerSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        await prisma.member.delete({
            where: {
                id: validated.data.memberId,
                role: { not: 'OWNER' },
                Organization: { Members: { some: { role: { in: ['MANAGER', 'OWNER'] }, User: { id: session.userId } } } },
            },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - removeMember' };
    }
};
