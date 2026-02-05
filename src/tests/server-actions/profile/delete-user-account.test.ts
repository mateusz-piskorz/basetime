import { getStatObject, uploadFile } from '@/lib/minio';
import { prisma } from '@/lib/prisma';
import { deleteUserAccount } from '@/lib/server-actions/profile';
import { loadTestNonSharedBuffer } from '@/tests/utils/example-img';
import { mockSession } from '@/tests/utils/mock-session';
import bcrypt from 'bcrypt';

const userId = 'id123';
const password = 'john1234';
const orgId = 'organizationId123';

beforeEach(async () => {
    const pwHash = await bcrypt.hash(password, 9);
    await prisma.user.create({
        data: { id: userId, email: 'john@spoko.pl', name: 'john', password: pwHash },
    });
    await prisma.organization.create({
        data: { id: orgId, name: 'o', currency: 'EUR', Members: { create: { role: 'OWNER', userId } } },
    });
});

test('User can delete account and organization', async () => {
    mockSession(userId);
    const res = await deleteUserAccount({ password });
    expect(res.success).toBe(true);

    expect(await prisma.user.findUnique({ where: { id: userId } })).toBe(null);
    expect(await prisma.organization.findUnique({ where: { id: orgId } })).toBe(null);
});

test('deleteUserAccount also deletes user avatar', async () => {
    mockSession(userId);
    const fileName = `user/${userId}/avatar.png`;
    await uploadFile({ bucket: 'main', file: loadTestNonSharedBuffer(), fileName });

    await deleteUserAccount({ password });

    expect(await getStatObject({ bucket: 'main', fileName })).toBe(undefined);
});
