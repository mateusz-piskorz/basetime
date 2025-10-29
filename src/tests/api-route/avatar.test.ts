import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/utils/encrypt';
import dayjs from 'dayjs';
import { getStatObject, minioClient } from '../../lib/minio';
import { API_BASE_URL } from '../utils/constants';
import { getTestFileFormData, loadTestNonSharedBuffer } from '../utils/example-img';

const userWithAvatarFileName = 'user-avatar/userWithAvatarAvatarId.jpeg';
const userId = 'randId';
const apiUrl = `${API_BASE_URL}/user-avatar`;
let headers: HeadersInit;

describe('avatar', () => {
    beforeAll(async () => {
        const expiresAt = dayjs().add(1, 'day').toDate();
        const testUserSession = await encrypt({ sessionId: userId, expiresAt });
        headers = { Cookie: `session=${testUserSession}` };

        await prisma.user.create({
            data: {
                email: '3',
                name: '3',
                password: '3',
                id: userId,
                Session: { create: { expiresAt, userAgent: '', id: userId } },
            },
        });

        await minioClient.putObject('public', userWithAvatarFileName, loadTestNonSharedBuffer(), undefined, {
            'user-meta-test': 'userWithAvatar',
        });
    });

    test('user can update avatar', async () => {
        const data = await fetch(apiUrl, {
            method: 'POST',
            body: getTestFileFormData(),
            headers,
        }).then((res) => res.json());

        expect(data.success).toBe(true);
        const user = await prisma.user.findUnique({ where: { id: userId } });

        expect(await getStatObject({ bucket: 'public', fileName: `user-avatar/${user?.avatarId}.jpeg` })).not.toBe(undefined);
    });

    test('userWithAvatar still has its own avatar', async () => {
        const obj = await getStatObject({ bucket: 'public', fileName: userWithAvatarFileName });

        expect(obj?.metaData['user-meta-test']).toBe('userWithAvatar');
    });

    test('user can delete avatar', async () => {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        expect(await getStatObject({ bucket: 'public', fileName: `user-avatar/${user?.avatarId}.jpeg` })).not.toBe(undefined);
        const data = await fetch(apiUrl, {
            method: 'DELETE',
            headers,
        }).then((res) => res.json());

        expect(data.success).toBe(true);
        expect(await getStatObject({ bucket: 'public', fileName: `user-avatar/${user?.avatarId}.jpeg` })).toBe(undefined);
        expect((await prisma.user.findUnique({ where: { id: userId } }))?.avatarId).toBe(null);
    });
});
