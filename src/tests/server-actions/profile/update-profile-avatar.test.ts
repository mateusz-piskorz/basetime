import { getStatObject, minioClient } from '@/lib/minio';
import { prisma } from '@/lib/prisma';
import { updateProfileAvatar } from '@/lib/server-actions/profile';
import { getTestBase64String, loadTestNonSharedBuffer } from '@/tests/utils/example-img';
import { mockSession } from '@/tests/utils/mock-session';

const userId1 = 'userId1';
const user2 = { id: 'userId2', avatarId: 'avatarId1' };

beforeEach(async () => {
    await prisma.user.create({ data: { email: '1', name: '', password: '', id: userId1 } });
    await prisma.user.create({ data: { email: '2', name: '', password: '', id: user2.id, avatarId: user2.avatarId } });

    await minioClient.putObject('public', `user-avatar/${user2.avatarId}.jpeg`, loadTestNonSharedBuffer(), undefined, {
        'user2-meta-test': 'userWithAvatar',
    });
});

test('user can update profile avatar', async () => {
    mockSession(userId1);
    const res = await updateProfileAvatar({ avatarBase64: getTestBase64String() });
    expect(res.success).toBe(true);

    const user = await prisma.user.findUnique({ where: { id: userId1 } });
    const stat = await getStatObject({ bucket: 'public', fileName: `user-avatar/${user?.avatarId}.jpeg` });
    expect(stat).not.toBe(undefined);
});

test('user can remove profile avatar', async () => {
    const initialUser = await prisma.user.findUnique({ where: { id: userId1 } });
    mockSession(userId1, { avatarId: initialUser?.avatarId || '' });

    const res = await updateProfileAvatar({ avatarBase64: null });
    expect(res.success).toBe(true);

    const stat = await getStatObject({ bucket: 'public', fileName: `user-avatar/${initialUser?.avatarId}.jpeg` });
    expect(stat).toBe(undefined);
});
