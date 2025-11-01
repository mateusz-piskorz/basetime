/* eslint-disable @typescript-eslint/no-explicit-any */

import sharp from 'sharp';
import { z } from 'zod';
import { getSession } from '../session'; // adjust this import!

export function action<T extends z.ZodType, H extends (validated: z.infer<T>, session: NonNullable<Awaited<ReturnType<typeof getSession>>>) => any>(
    schema: T,
    handler: H,
): (data: z.infer<T>) => Promise<Awaited<ReturnType<H>>> {
    return async (data: z.infer<T>) => {
        const validated = schema.safeParse(data);
        if (!validated.success) {
            return { success: false, message: 'Error validating fields' };
        }

        const session = await getSession();
        if (!session) {
            return { success: false, message: 'Error session invalid' };
        }

        return handler(validated.data, session);
    };
}

const validateBase64Schema = z.object({
    buffer: z.instanceof(Buffer),
    mimeType: z.string().refine((type) => type === 'image/png', {
        message: 'Allowed file extensions: image/png',
    }),
    size: z.number().max(1000000, 'max file size is 1mb'),
});

export async function validateBase64({ base64, type, width, height }: { base64: string; width: number; height: number; type: 'jpeg' | 'png' }) {
    const matches = base64.match(/^data:(.+);base64,(.*)$/);
    const mimeType = matches ? matches[1] : 'application/octet-stream';
    const data = matches ? matches[2] : base64;
    const buffer = Buffer.from(data, 'base64');
    const size = buffer.length;

    const validated = validateBase64Schema.safeParse({ buffer, mimeType, size });

    if (!validated.success) return null;

    return await sharp(buffer).resize(width, height, { fit: 'cover', position: 'center' })[type]({ quality: 100 }).toBuffer();
}
