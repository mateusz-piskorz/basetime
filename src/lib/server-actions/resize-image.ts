'use server';

import { resizeImageUtil } from '@/lib/utils/files';
import z from 'zod';
import { getSession } from '../session';
import { resizeImageSchema } from '../zod/resize-image';

export const resizeImage = async (data: z.infer<typeof resizeImageSchema>) => {
    try {
        const validated = resizeImageSchema.safeParse(data);

        if (validated.error) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        const { image } = validated.data;

        const resizedImg = await resizeImageUtil({ image });

        return { success: true, data: { base64: resizedImg } };
    } catch {
        return { success: false, message: 'Error something went wrong - resizeImage' };
    }
};
