import { prisma } from '@/lib/prisma';
import { deleteUserAccount, updatePassword, updateProfile } from '@/lib/server-actions/profile';
import bcrypt from 'bcrypt';

const email = 'john@spoko.pl';
const password = 'john1234';
const updatedPassword = 'john12345';
const name = 'john doe';
const updatedName = 'john doe2';
const userId = 'id123';
const organizationId = 'organizationId123';

jest.mock('@/lib/session', () => ({
    getSession: () => ({
        userId: userId,
    }),
}));

test('profile setup', async () => {
    const pwHash = await bcrypt.hash(password, 9);
    await prisma.user.create({ data: { email, name, password: pwHash, id: userId } });
    await prisma.organization.create({
        data: { id: organizationId, name: 'o', currency: 'EUR', Members: { create: { role: 'OWNER', userId } } },
    });
});

test('User can update profile', async () => {
    const res = await updateProfile({ name: updatedName });

    expect(res.success).toBe(true);
    expect(res.data?.name).toBe(updatedName);
});

test('User can not update password - incorrect password', async () => {
    const res = await updatePassword({ current_password: 'incorrect-password', password: 'password', password_confirmation: 'password' });
    expect(res.success).toBe(false);
    expect(res.message).toBe('Error password incorrect');
});

test('User can update password', async () => {
    const res = await updatePassword({ current_password: password, password: updatedPassword, password_confirmation: updatedPassword });
    expect(res.success).toBe(true);
    const user = await prisma.user.findUnique({ where: { id: res.data?.id } });
    expect(await bcrypt.compare(updatedPassword, user!.password)).toBe(true);
});

test('User can delete account', async () => {
    const res = await deleteUserAccount({ password: updatedPassword });
    expect(res.success).toBe(true);
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user).toBe(null);
    const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
    expect(organization).toBe(null);
});
