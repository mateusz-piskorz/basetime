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
const orgId = 'orgid';

test('logo setup', async () => {
    const pwHash = await bcrypt.hash(password, 9);
    await prisma.user.create({
        data: { email: '', name: '', password: pwHash, id: userId, Session: { create: { expiresAt, userAgent: '', id: sessionId } } },
    });

    await prisma.organization.create({ data: { id: orgId, currency: 'EUR', name: '', Members: { create: { role: 'OWNER', userId } } } });

    expect(await prisma.user.findUnique({ where: { id: userId } })).not.toBe(null);
});

test('owner can update logo', async () => {
    const img = loadTestFile();
    const formData = new FormData();
    formData.set('file', img);
    const session = await encrypt({ sessionId, expiresAt });
    const res = await fetch(`http://localhost:3000/api/org/${orgId}/logo`, {
        method: 'POST',
        body: formData,
        headers: {
            Cookie: `session=${session}`,
        },
    });
    const data = await res.json();
    expect(data.success).toBe(true);
    const fileName = `organization/${orgId}/logo.png`;
    expect(await getStatObject({ bucket: 'main', fileName })).not.toBe(undefined);
});

test('owner can delete logo', async () => {
    const session = await encrypt({ sessionId, expiresAt });
    const res = await fetch(`http://localhost:3000/api/org/${orgId}/logo`, {
        method: 'DELETE',
        headers: {
            Cookie: `session=${session}`,
        },
    });
    const data = await res.json();
    expect(data.success).toBe(true);
    const fileName = `organization/${orgId}/logo.png`;
    expect(await getStatObject({ bucket: 'main', fileName })).toBe(undefined);
});
