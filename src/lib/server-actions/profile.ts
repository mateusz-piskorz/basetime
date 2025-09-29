'use server';

import bcrypt from 'bcrypt';
import z from 'zod';
import { deleteFile } from '../minio';
import { prisma } from '../prisma';
import { getSession } from '../session';
import { deleteUserAccountSchema, updatePasswordSchema, updateProfileSchema } from '../zod/profile-schema';

export const updateProfile = async (data: z.infer<typeof updateProfileSchema>) => {
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

        const res = await prisma.user.update({
            where: { id: session.userId },
            data: { name },
            select: { id: true, name: true },
        });

        return { success: true, data: res };
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

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { password, current_password } = validated.data;

        const user = await prisma.user.findUnique({ where: { id: session.userId } });

        if (!user) {
            return { success: false, message: 'Error user not found' };
        }

        if (!(await bcrypt.compare(current_password, user?.password))) {
            return { success: false, message: 'Error password incorrect' };
        }

        const pwHash = await bcrypt.hash(password, 9);

        const res = await prisma.user.update({ where: { id: session.userId }, data: { password: pwHash }, select: { id: true } });

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error something went wrong - updateProfile' };
    }
};

export const deleteUserAccount = async (data: z.infer<typeof deleteUserAccountSchema>) => {
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

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { password: true, Members: { select: { organizationId: true }, where: { role: 'OWNER' } } },
        });

        if (!user) {
            return { success: false, message: 'Error user not found' };
        }

        if (!(await bcrypt.compare(password, user?.password))) {
            return { success: false, message: 'Error password incorrect' };
        }

        await prisma.organization.deleteMany({
            where: {
                id: {
                    in: user.Members.map((member) => member.organizationId),
                },
            },
        });

        await prisma.user.delete({ where: { id: session.userId } });

        const fileName = `user/${session.userId}/avatar.png`;
        await deleteFile({ bucket: 'main', fileName });

        return { success: true };
    } catch {
        return { success: false, message: 'Error something went wrong - deleteUserAccount' };
    }
};
