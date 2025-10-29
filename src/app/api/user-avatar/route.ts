import { deleteFile, uploadFile } from '@/lib/minio'; // your existing upload function
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { imgSchema } from '@/lib/zod/img-schema';
import { createId } from '@paralleldrive/cuid2';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Error session invalid' });
        }

        const formData = await req.formData();

        const file = formData.get('file') as unknown as File;

        const validated = imgSchema.safeParse({ img: file });
        if (validated.error) {
            return NextResponse.json({ success: false, message: 'Error validating fields' });
        }
        const buffer = await file.arrayBuffer();

        const resizedBuffer = await sharp(buffer).resize(200, 200, { fit: 'cover', position: 'center' }).jpeg({ quality: 100 }).toBuffer();

        const newAvatarId = createId();

        if (session.avatarId) await deleteFile({ bucket: 'public', fileName: `user-avatar/${session.avatarId}.jpeg` });
        await uploadFile({ bucket: 'public', file: resizedBuffer, fileName: `user-avatar/${newAvatarId}.jpeg` });
        await prisma.user.update({ where: { id: session.userId }, data: { avatarId: newAvatarId } });

        return NextResponse.json({ success: true, message: 'Avatar updated' });
    } catch {
        return NextResponse.json({ success: false, message: 'Something went wrong - update-avatar' });
    }
}

export async function DELETE() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Error session invalid' });
        }

        await deleteFile({ bucket: 'public', fileName: `user-avatar/${session.avatarId}.jpeg` });
        await prisma.user.update({ where: { id: session.userId }, data: { avatarId: null } });

        return NextResponse.json({ success: true, message: 'Avatar deleted' });
    } catch {
        return NextResponse.json({ success: false, message: 'Something went wrong - delete-avatar' });
    }
}
