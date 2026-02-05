import { prisma } from '@/lib/prisma';
import { signup } from '@/lib/server-actions/auth';
import { createSession } from '@/lib/session';

jest.mock('next/headers', () => ({
    headers: () => ({ get: (key: string) => `MockedHeader-${key}` }),
}));

const userStub = { email: 'john@spoko.pl', password: 'john1234', name: 'john doe' };

test('User can sign up', async () => {
    await signup(userStub);

    const user = await prisma.user.findUnique({ where: { email: userStub.email } });

    expect(user?.name).toBe(userStub.name);
    expect(createSession).toHaveBeenCalledWith({
        userId: user?.id,
        userAgent: 'MockedHeader-user-agent',
    });
});

test('User cannot sign up if email already exists', async () => {
    await signup(userStub);
    const res = await signup(userStub);

    expect(res.success).toBe(false);
    expect(res.message).toBe('Error provided email already exists in database');
});
