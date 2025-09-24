import { deleteFile, uploadFile } from '@/lib/minio';
import { getSession } from '@/lib/session';
import { updateAvatarServerSchema } from '@/lib/zod/profile-schema';
import sharp from 'sharp';
import { publicProcedure } from '../init';

export const updateAvatar = publicProcedure.input(updateAvatarServerSchema).mutation(async ({ input: { formData } }) => {
    try {
        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const fileName = `user/${session.userId}/avatar.png`;

        if (formData) {
            const profile_img = formData.get('profile_img') as File;
            const buffer = await profile_img.arrayBuffer();
            const img = sharp(buffer);

            const imgBuffer = await img.resize(200, 200, { fit: 'cover', position: 'center' }).png({ quality: 100 }).toBuffer();

            await uploadFile({ bucket: 'main', file: imgBuffer, fileName });
        } else {
            await deleteFile({ bucket: 'main', fileName });
        }

        return { success: true, message: '' };
    } catch {
        return { success: false, message: 'Error something went wrong - updateAvatar' };
    }
});
