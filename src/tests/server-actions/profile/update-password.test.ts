import { prisma } from '@/lib/prisma';
import { updatePassword } from '@/lib/server-actions/profile';
import { mockSession } from '@/tests/utils/mock-session';
import bcrypt from 'bcrypt';

const userId = 'id123';
const password = 'john1234';

beforeEach(async () => {
    const pwHash = await bcrypt.hash(password, 9);
    await prisma.user.create({
        data: { id: userId, email: 'john@spoko.pl', name: 'john', password: pwHash },
    });
});

test('User can not update password - incorrect password', async () => {
    mockSession(userId);
    const res = await updatePassword({
        current_password: 'incorrect-password',
        password: 'new',
        password_confirmation: 'new',
    });
    expect(res.success).toBe(false);
    expect(res.message).toBe('Error password incorrect');
});

test('User can update password', async () => {
    mockSession(userId);
    const updatedPassword = 'john12345';
    const res = await updatePassword({
        current_password: password,
        password: updatedPassword,
        password_confirmation: updatedPassword,
    });

    expect(res.success).toBe(true);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(await bcrypt.compare(updatedPassword, user!.password)).toBe(true);
});
