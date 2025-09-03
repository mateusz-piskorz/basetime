'use server';

import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { updateMemberSchema } from '../zod/member-schema';

export const updateMember = async ({ data, memberId }: { data: z.infer<typeof updateMemberSchema>; memberId: string }) => {
    try {
        const validated = updateMemberSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { role, hourlyRate, projectIds } = validated.data;

        await prisma.member.update({
            where: {
                id: memberId,
                ...(role !== 'OWNER' && { role: { not: 'OWNER' } }),
                Organization: { Members: { some: { role: { in: ['MANAGER', 'OWNER'] }, User: { id: session.id } } } },
            },
            data: {
                ...(role !== 'OWNER' && { role }),
                ...(hourlyRate && { HourlyRates: { create: { value: hourlyRate } } }),
                Projects: { set: [], connect: projectIds?.map((id) => ({ id })) },
            },
        });

        return { success: true };
    } catch (error) {
        console.log(error);
        return { success: false, message: 'Error something went wrong - updateRole' };
    }
};

export const removeMember = async ({ memberId }: { memberId: string }) => {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        await prisma.member.delete({
            where: {
                id: memberId,
                role: { not: 'OWNER' },
                Organization: { Members: { some: { role: { in: ['MANAGER', 'OWNER'] }, User: { id: session.id } } } },
            },
        });

        return { success: true };
    } catch (error) {
        console.log(error);
        return { success: false, message: 'Error something went wrong - removeMember' };
    }
};
