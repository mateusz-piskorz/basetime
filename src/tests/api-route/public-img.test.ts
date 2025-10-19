import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/utils/encrypt';
import dayjs from 'dayjs';
import { getStatObject, minioClient } from '../../lib/minio';
import { API_BASE_URL } from '../utils/constants';
import { getTestFileFormData, loadTestNonSharedBuffer } from '../utils/example-img';

const exstImgFilePath = 'blog/exst.png';
const adminUserId = 'adminId';
const regularUserId = 'regularId';
const fileName = 'file-name-test.png';
const apiUrl = `${API_BASE_URL}/public-blog-img`;
let headersAdmin: HeadersInit;
let headersRegular: HeadersInit;

describe('avatar', () => {
    beforeAll(async () => {
        const expiresAt = dayjs().add(1, 'day').toDate();
        const adminSession = await encrypt({ sessionId: adminUserId, expiresAt });
        const regularSession = await encrypt({ sessionId: regularUserId, expiresAt });
        headersAdmin = { Cookie: `session=${adminSession}` };
        headersRegular = { Cookie: `session=${regularSession}` };

        // admin
        await prisma.user.create({
            data: {
                email: '1',
                name: '1',
                password: '1',
                id: adminUserId,
                role: 'ADMIN',
                Session: { create: { expiresAt, userAgent: '', id: adminUserId } },
            },
        });

        // regular
        await prisma.user.create({
            data: {
                email: '2',
                name: '2',
                password: '2',
                id: regularUserId,
                role: 'USER',
                Session: { create: { expiresAt, userAgent: '', id: regularUserId } },
            },
        });

        await minioClient.putObject('public', exstImgFilePath, loadTestNonSharedBuffer(), undefined, {
            'exst-meta-test': 'exstImg',
        });
    });

    test('regular user can not add public blog img', async () => {
        const data = await fetch(apiUrl, {
            method: 'POST',
            body: getTestFileFormData(fileName),
            headers: headersRegular,
        }).then((res) => res.json());

        expect(data.success).toBe(false);
        expect(await getStatObject({ bucket: 'public', fileName: `blog/${fileName}` })).toBe(undefined);
    });

    test('admin can add public blog img', async () => {
        const data = await fetch(apiUrl, {
            method: 'POST',
            body: getTestFileFormData(fileName),
            headers: headersAdmin,
        }).then((res) => res.json());

        expect(data.success).toBe(true);
        expect(await getStatObject({ bucket: 'public', fileName: `blog/${fileName}` })).not.toBe(undefined);
        const exstObj = await getStatObject({ bucket: 'public', fileName: exstImgFilePath });
        expect(exstObj?.metaData['exst-meta-test']).toBe('exstImg');
    });

    test('regular user can not remove public blog img', async () => {
        const formData = new FormData();
        formData.set('filePath', `blog/${fileName}`);

        const data = await fetch(apiUrl, {
            method: 'DELETE',
            body: formData,
            headers: headersRegular,
        }).then((res) => res.json());

        expect(data.success).toBe(false);
        expect(await getStatObject({ bucket: 'public', fileName: `blog/${fileName}` })).not.toBe(undefined);
    });

    test('admin can remove public blog img', async () => {
        const formData = new FormData();
        formData.set('filePath', `blog/${fileName}`);

        const data = await fetch(apiUrl, {
            method: 'DELETE',
            body: formData,
            headers: headersAdmin,
        }).then((res) => res.json());

        expect(data.success).toBe(true);
        expect(await getStatObject({ bucket: 'public', fileName: `blog/${fileName}` })).toBe(undefined);
        const exstObj = await getStatObject({ bucket: 'public', fileName: exstImgFilePath });
        expect(exstObj?.metaData['exst-meta-test']).toBe('exstImg');
    });
});
