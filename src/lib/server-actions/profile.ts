'use server';

import bcrypt from 'bcrypt';
import z from 'zod';
import { prisma } from '../prisma';
import { verifySession } from '../session';
import { updatePasswordSchema, updateProfileSchema } from '../zod/profile-schema';

export const updateProfile = async (data: z.infer<typeof updateProfileSchema>) => {
    try {
        const validated = updateProfileSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await verifySession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { name } = validated.data;

        await prisma.user.update({ where: { id: session?.id }, data: { name } });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - updateProfile' };
    }
};

export const updatePassword = async (data: z.infer<typeof updatePasswordSchema>) => {
    try {
        const validated = updatePasswordSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await verifySession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { password, current_password } = validated.data;

        const user = await prisma.user.findUnique({ where: { id: session.id } });

        if (!user) {
            return { success: false, message: 'Error user not found' };
        }

        if (!(await bcrypt.compare(current_password, user?.password))) {
            return { success: false, message: 'Error password incorrect' };
        }

        await prisma.user.update({ where: { id: session?.id }, data: { password } });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - updateProfile' };
    }
};
