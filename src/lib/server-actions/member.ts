'use server';

import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { updateHourlyRateSchema, updateRoleSchema } from '../zod/member-schema';

export const updateHourlyRate = async ({ data, memberId }: { data: z.infer<typeof updateHourlyRateSchema>; memberId: string }) => {
    try {
        const validated = updateHourlyRateSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { hourlyRate } = validated.data;

        await prisma.member.update({
            where: { id: memberId, Organization: { Members: { some: { role: { in: ['MANAGER', 'OWNER'] }, User: { id: session.id } } } } },
            data: { HourlyRates: { create: { value: hourlyRate } } },
        });

        return { success: true };
    } catch (error) {
        console.log(error);
        return { success: false, message: 'Error something went wrong - updateHourlyRate' };
    }
};

export const updateRole = async ({ data, memberId }: { data: z.infer<typeof updateRoleSchema>; memberId: string }) => {
    try {
        const validated = updateRoleSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { role } = validated.data;

        await prisma.member.update({
            where: { id: memberId, Organization: { Members: { some: { role: { in: ['MANAGER', 'OWNER'] }, User: { id: session.id } } } } },
            data: { role },
        });

        return { success: true };
    } catch (error) {
        console.log(error);
        return { success: false, message: 'Error something went wrong - updateHourlyRate' };
    }
};
