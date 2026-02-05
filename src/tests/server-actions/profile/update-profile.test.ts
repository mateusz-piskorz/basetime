import { prisma } from '@/lib/prisma';
import { updateProfile } from '@/lib/server-actions/profile';
import { mockSession } from '@/tests/utils/mock-session';

const userId = 'id123';

beforeEach(async () => {
    await prisma.user.create({
        data: { id: userId, email: 'john@spoko.pl', name: 'john doe', password: 'hash' },
    });
});

test('User can update profile', async () => {
    mockSession(userId);
    const updatedName = 'john doe2';
    const res = await updateProfile({ name: updatedName });

    expect(res.success).toBe(true);
    expect(res.data?.name).toBe(updatedName);
});
