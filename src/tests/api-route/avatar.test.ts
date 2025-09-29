import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/utils/encrypt';
import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import { getStatObject } from '../../lib/minio';
import { loadTestFile } from '../utils/example-img';

const password = 'john1234';
const userId = 'id123';
const sessionId = 'id123';
const expiresAt = dayjs().add(1, 'day').toDate();

test('avatar setup', async () => {
    const pwHash = await bcrypt.hash(password, 9);
    await prisma.user.create({
        data: { email: '', name: '', password: pwHash, id: userId, Session: { create: { expiresAt, userAgent: '', id: sessionId } } },
    });

    expect(await prisma.user.findUnique({ where: { id: userId } })).not.toBe(null);
});

test('user can update avatar', async () => {
    const img = loadTestFile();
    const formData = new FormData();
    formData.set('file', img);
    const session = await encrypt({ sessionId, expiresAt });
    const res = await fetch('http://localhost:3000/api/user-avatar', {
        method: 'POST',
        body: formData,
        headers: {
            Cookie: `session=${session}`,
        },
    });
    const data = await res.json();
    expect(data.success).toBe(true);
    const fileName = `user/${userId}/avatar.png`;
    expect(await getStatObject({ bucket: 'main', fileName })).not.toBe(undefined);
});

test('user can delete avatar', async () => {
    const session = await encrypt({ sessionId, expiresAt });
    const res = await fetch('http://localhost:3000/api/user-avatar', {
        method: 'DELETE',

        headers: {
            Cookie: `session=${session}`,
        },
    });
    const data = await res.json();
    expect(data.success).toBe(true);
    const fileName = `user/${userId}/avatar.png`;
    expect(await getStatObject({ bucket: 'main', fileName })).toBe(undefined);
});
