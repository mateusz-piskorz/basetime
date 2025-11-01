import { prisma } from '@/lib/prisma';
import { deleteUserAccount, updatePassword, updateProfile, updateProfileAvatar } from '@/lib/server-actions/profile';
import bcrypt from 'bcrypt';
import { getStatObject, minioClient, uploadFile } from '../../lib/minio';
import { getTestBase64String, loadTestNonSharedBuffer } from '../utils/example-img';
import { mockSession } from '../utils/mock-session';

const email = 'john@spoko.pl';
const password = 'john1234';
const updatedPassword = 'john12345';
const name = 'john doe';
const updatedName = 'john doe2';
const userId = 'id123';
const organizationId = 'organizationId123';

const setupUser = async () => {
    const pwHash = await bcrypt.hash(password, 9);
    await prisma.user.create({ data: { email, name, password: pwHash, id: userId } });

    expect(await prisma.user.findUnique({ where: { email } })).not.toBe(null);
};

test('profile setup', async () => {
    await setupUser();
    await prisma.organization.create({
        data: { id: organizationId, name: 'o', currency: 'EUR', Members: { create: { role: 'OWNER', userId } } },
    });
});

test('User can update profile', async () => {
    mockSession(userId);
    const res = await updateProfile({ name: updatedName });

    expect(res.success).toBe(true);
    expect(res.data?.name).toBe(updatedName);
});

test('User can not update password - incorrect password', async () => {
    mockSession(userId);
    const res = await updatePassword({ current_password: 'incorrect-password', password: 'password', password_confirmation: 'password' });
    expect(res.success).toBe(false);
    expect(res.message).toBe('Error password incorrect');
});

test('User can update password', async () => {
    mockSession(userId);
    const res = await updatePassword({ current_password: password, password: updatedPassword, password_confirmation: updatedPassword });
    expect(res.success).toBe(true);
    const user = await prisma.user.findUnique({ where: { id: res.data?.id } });
    expect(await bcrypt.compare(updatedPassword, user!.password)).toBe(true);
});

test('User can delete account', async () => {
    mockSession(userId);
    const res = await deleteUserAccount({ password: updatedPassword });
    expect(res.success).toBe(true);
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).toBe(null);
    const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
    expect(organization).toBe(null);
});

test('deleteUserAccount also deletes user avatar', async () => {
    mockSession(userId);
    await setupUser();
    const fileName = `user/${userId}/avatar.png`;
    await uploadFile({ bucket: 'main', file: loadTestNonSharedBuffer(), fileName });
    expect(await getStatObject({ bucket: 'main', fileName })).not.toBe(undefined);

    const res = await deleteUserAccount({ password });

    expect(res.success).toBe(true);

    expect(await getStatObject({ bucket: 'main', fileName })).toBe(undefined);
});

describe('updateProfileAvatar', () => {
    const userId1 = 'userId1';
    const user2 = { id: 'userId2', avatarId: 'avatarId1' };

    beforeAll(async () => {
        await prisma.user.deleteMany({});
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

        expect(await getStatObject({ bucket: 'public', fileName: `user-avatar/${user?.avatarId}.jpeg` })).not.toBe(undefined);

        // user2 avatar not changed
        const obj = await getStatObject({ bucket: 'public', fileName: `user-avatar/${user2?.avatarId}.jpeg` });
        expect(obj?.metaData['user2-meta-test']).toBe('userWithAvatar');
    });

    test('user can remove profile avatar', async () => {
        const user = await prisma.user.findUnique({ where: { id: userId1 } });
        mockSession(userId1, { avatarId: user?.avatarId || '' });

        const res = await updateProfileAvatar({ avatarBase64: null });

        expect(res.success).toBe(true);

        expect(await getStatObject({ bucket: 'public', fileName: `user-avatar/${user?.avatarId}.jpeg` })).toBe(undefined);

        // user2 avatar not changed
        const obj = await getStatObject({ bucket: 'public', fileName: `user-avatar/${user2?.avatarId}.jpeg` });
        expect(obj?.metaData['user2-meta-test']).toBe('userWithAvatar');
    });
});
