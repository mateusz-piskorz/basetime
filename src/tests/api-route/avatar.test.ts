import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/utils/encrypt';
import dayjs from 'dayjs';
import { getStatObject } from '../../lib/minio';
import { API_URL } from '../utils/constants';
import { getTestFileFormData } from '../utils/example-img';

const userId = 'uid';
const sessionId = 'sid';
const expiresAt = dayjs().add(1, 'day').toDate();
const fileName = `user/${userId}/avatar.png`;
let headers: HeadersInit;

describe('avatar', () => {
    beforeAll(async () => {
        const session = await encrypt({ sessionId, expiresAt });
        headers = { Cookie: `session=${session}` };
        await prisma.user.create({
            data: {
                email: '',
                name: '',
                password: '',
                id: userId,
                Session: { create: { expiresAt, userAgent: '', id: sessionId } },
            },
        });
    });

    test('user can update avatar', async () => {
        const data = await fetch(`${API_URL}/user-avatar`, {
            method: 'POST',
            body: getTestFileFormData(),
            headers,
        }).then((res) => res.json());

        expect(data.success).toBe(true);
        expect(await getStatObject({ bucket: 'main', fileName })).not.toBe(undefined);
    });

    test('user can delete avatar', async () => {
        const data = await fetch(`${API_URL}/user-avatar`, {
            method: 'DELETE',
            headers,
        }).then((res) => res.json());

        expect(data.success).toBe(true);
        expect(await getStatObject({ bucket: 'main', fileName })).toBe(undefined);
    });
});
