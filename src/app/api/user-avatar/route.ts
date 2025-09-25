import { deleteFile, uploadFile } from '@/lib/minio'; // your existing upload function
import { getSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Something went wrong - update-avatar api post' });
        }

        const formData = await req.formData();
        const file = formData.get('file') as unknown as File;
        const buffer = await file.arrayBuffer();

        const resizedBuffer = await sharp(buffer).resize(200, 200, { fit: 'cover', position: 'center' }).png({ quality: 100 }).toBuffer();

        const fileName = `user/${session.userId}/avatar.png`;

        await uploadFile({ bucket: 'main', file: resizedBuffer, fileName });

        return NextResponse.json({ success: true, message: 'Avatar uploaded and resized' });
    } catch (e) {
        console.log(e);
        return NextResponse.json({ success: false, message: 'Something went wrong - update-avatar api post' });
    }
}

export async function DELETE() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, error: 'Something went wrong - update-avatar api delete' });
        }

        const fileName = `user/${session.userId}/avatar.png`;

        await deleteFile({ bucket: 'main', fileName });

        return NextResponse.json({ success: true, message: 'Avatar uploaded and resized' });
    } catch {
        return NextResponse.json({ success: false, message: 'Something went wrong - update-avatar api delete' });
    }
}
