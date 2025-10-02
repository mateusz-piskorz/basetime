import { deleteFile, uploadFile } from '@/lib/minio'; // your existing upload function
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { imgSchema } from '@/lib/zod/img-schema';
import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = await params;

    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Error session invalid' });
        }

        const organization = await prisma.organization.findUnique({
            where: { id: orgId, Members: { some: { userId: session.userId, role: 'OWNER' } } },
        });

        if (!organization) {
            return NextResponse.json({ success: false, message: 'Error permissions' });
        }

        const formData = await req.formData();

        const file = formData.get('file') as unknown as File;

        const validated = imgSchema.safeParse({ img: file });
        if (validated.error) {
            return NextResponse.json({ success: false, message: 'Error validating fields' });
        }

        const buffer = await file.arrayBuffer();

        const resizedBuffer = await sharp(buffer).resize(200, 200, { fit: 'cover', position: 'center' }).png({ quality: 100 }).toBuffer();

        const fileName = `organization/${orgId}/logo.png`;

        await uploadFile({ bucket: 'main', file: resizedBuffer, fileName });

        return NextResponse.json({ success: true, message: 'logo updated' });
    } catch {
        return NextResponse.json({ success: false, message: 'Something went wrong - update-logo' });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ orgId: string }> }) {
    const { orgId } = await params;
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ success: false, message: 'Error session invalid' });
        }

        const organization = await prisma.organization.findUnique({
            where: { id: orgId, Members: { some: { userId: session.userId, role: 'OWNER' } } },
        });

        if (!organization) {
            return NextResponse.json({ success: false, message: 'Error permissions' });
        }

        const fileName = `organization/${orgId}/logo.png`;

        await deleteFile({ bucket: 'main', fileName });

        return NextResponse.json({ success: true, message: 'logo deleted' });
    } catch {
        return NextResponse.json({ success: false, message: 'Something went wrong - delete-logo' });
    }
}
