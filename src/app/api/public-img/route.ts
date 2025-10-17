import { deleteFile, uploadFile } from '@/lib/minio'; // your existing upload function
import { getSession } from '@/lib/session';
import { imgSchema } from '@/lib/zod/img-schema';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, message: 'Error permission invalid' });

        const formData = await req.formData();
        const file = formData.get('file') as unknown as File;

        const validated = imgSchema.safeParse({ img: file });
        if (validated.error) return NextResponse.json({ success: false, message: 'Error validating fields' });

        const buffer = await file.arrayBuffer();

        const resizedBuffer = await sharp(buffer).toBuffer();

        await uploadFile({ bucket: 'public', file: resizedBuffer, fileName: `blog/${file.name}` });

        return NextResponse.json({ success: true, message: 'img created' });
    } catch {
        return NextResponse.json({ success: false, message: 'Something went wrong - add-public-img' });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.role !== 'ADMIN') return NextResponse.json({ success: false, message: 'Error permission invalid' });

        const formData = await req.formData();
        const fileName = formData.get('fileName') as unknown as string;

        await deleteFile({ bucket: 'public', fileName });

        return NextResponse.json({ success: true, message: 'img deleted' });
    } catch {
        return NextResponse.json({ success: false, message: 'Something went wrong - remove-public-img' });
    }
}
