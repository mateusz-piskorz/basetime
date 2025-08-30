'use server';

import bcrypt from 'bcrypt';
import z from 'zod';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { deleteUserAccountSchema, updatePasswordSchema, updateProfileSchema } from '../zod/profile-schema';

export const updateProfile = async ({ data }: { data: z.infer<typeof updateProfileSchema> }) => {
    try {
        const validated = updateProfileSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { name } = validated.data;

        await prisma.user.update({
            where: { id: session?.id },
            data: { name, PersonalOrganization: { update: { name } } },
            select: { id: true },
        });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - updateProfile' };
    }
};

export const updatePassword = async ({ data }: { data: z.infer<typeof updatePasswordSchema> }) => {
    try {
        const validated = updatePasswordSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
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

        const pwHash = await bcrypt.hash(password, 9);

        await prisma.user.update({ where: { id: session?.id }, data: { password: pwHash } });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - updateProfile' };
    }
};

// TODO: check if organizations are also removed
export const deleteUserAccount = async ({ data }: { data: z.infer<typeof deleteUserAccountSchema> }) => {
    try {
        const validated = deleteUserAccountSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { password } = validated.data;

        const user = await prisma.user.findUnique({ where: { id: session.id } });

        if (!user) {
            return { success: false, message: 'Error user not found' };
        }

        if (!(await bcrypt.compare(password, user?.password))) {
            return { success: false, message: 'Error password incorrect' };
        }

        await prisma.user.delete({ where: { id: session?.id } });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - deleteUserAccount' };
    }
};
