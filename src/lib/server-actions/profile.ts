'use server';

import bcrypt from 'bcrypt';
import { action } from '.';
import { deleteFile } from '../minio';
import { prisma } from '../prisma';
import { deleteUserAccountSchema, updatePasswordSchema, updateProfileSchema } from '../zod/profile-schema';

export const updateProfile = action(updateProfileSchema, async ({ name }, { userId }) => {
    try {
        const res = await prisma.user.update({
            where: { id: userId },
            data: { name },
            select: { id: true, name: true },
        });

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error - updateProfile' };
    }
});

export const updatePassword = action(updatePasswordSchema, async ({ current_password, password }, { userId }) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) return { success: false, message: 'Error user not found' };
        if (!(await bcrypt.compare(current_password, user?.password))) return { success: false, message: 'Error password incorrect' };

        const res = await prisma.user.update({ where: { id: userId }, data: { password: await bcrypt.hash(password, 9) }, select: { id: true } });

        return { success: true, data: res };
    } catch {
        return { success: false, message: 'Error - updatePassword' };
    }
});

export const deleteUserAccount = action(deleteUserAccountSchema, async ({ password }, { userId }) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { password: true, Members: { select: { organizationId: true }, where: { role: 'OWNER' } } },
        });

        if (!user) return { success: false, message: 'Error user not found' };

        if (!(await bcrypt.compare(password, user?.password))) {
            return { success: false, message: 'Error password incorrect' };
        }

        await prisma.organization.deleteMany({
            where: { id: { in: user.Members.map((member) => member.organizationId) } },
        });

        await prisma.user.delete({ where: { id: userId } });

        const fileName = `user/${userId}/avatar.png`;
        await deleteFile({ bucket: 'main', fileName });

        return { success: true };
    } catch {
        return { success: false, message: 'Error - deleteUserAccount' };
    }
});
