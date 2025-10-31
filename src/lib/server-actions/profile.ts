'use server';

import { createId } from '@paralleldrive/cuid2';
import bcrypt from 'bcrypt';
import { deleteFile, uploadFile } from '../minio';
import { prisma } from '../prisma';
import { deleteUserAccountSchema, updatePasswordSchema, updateProfileAvatarSchema, updateProfileSchema } from '../zod/profile-schema';
import { action, validateBase64 } from './_utils';

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

export const updateProfileAvatar = action(updateProfileAvatarSchema, async ({ avatarBase64 }, { userId, avatarId }) => {
    try {
        if (avatarBase64) {
            const buffer = await validateBase64({ base64: avatarBase64, type: 'jpeg', height: 276, width: 276 });
            if (!buffer) return { success: false, message: 'Error validating fields' };

            const newAvatarId = createId();

            if (avatarId) await deleteFile({ bucket: 'public', fileName: `user-avatar/${avatarId}.jpeg` });

            await uploadFile({ bucket: 'public', file: buffer, fileName: `user-avatar/${newAvatarId}.jpeg`, contentType: 'image/jpeg' });
            await prisma.user.update({ where: { id: userId }, data: { avatarId: newAvatarId } });
        } else {
            if (avatarId) await deleteFile({ bucket: 'public', fileName: `user-avatar/${avatarId}.jpeg` });
            await prisma.user.update({ where: { id: userId }, data: { avatarId: null } });
        }

        return { success: true };
    } catch (e) {
        console.log({ e });
        return { success: false, message: 'Error - updateProfileAvatar' };
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
