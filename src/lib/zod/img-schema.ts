import z from 'zod';
import { ACCEPTED_IMAGE_EXT } from '../constants/accepted-image-ext';

const ACCEPTED_IMAGE_TYPES = ['image/svg+xml', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const imgSchema = z.object({
    img: z
        .instanceof(File)
        .refine((file) => file.size < 15000000, 'max file size is 15mb')
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), `Allowed file extensions: ${ACCEPTED_IMAGE_EXT.join(', ')}`)
        .nullable(),
});
