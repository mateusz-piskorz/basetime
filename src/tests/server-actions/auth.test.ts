import { prisma } from '@/lib/prisma';
import { logout, signin, signup } from '@/lib/server-actions/auth';
import { createSession, deleteSession } from '@/lib/session';

jest.mock('next/headers', () => ({
    headers: () => ({
        get: (key: string) => {
            return `MockedHeader-${key}`;
        },
    }),
}));

const email = 'john@spoko.pl';
const password = 'john1234';
const name = 'john doe';

test('User can sing up', async () => {
    await signup({ email, password, name });
    const user = await prisma.user.findUnique({ where: { email } });

    expect(user?.name).toBe(name);
    expect(createSession).toHaveBeenCalledWith({ userId: user?.id, userAgent: 'MockedHeader-user-agent' });
});

test('User can not sing up if email already exists in database', async () => {
    const res = await signup({ email, password, name });
    expect(res.success).toBe(false);
    expect(res.message).toBe('Error provided email already exists in database');
});

test('User can sing in', async () => {
    const res = await signin({ email, password });
    expect(res.success).toBe(true);
    expect(createSession).toHaveBeenCalledTimes(2);
});

test('User can logout', async () => {
    const sessionId = 'sessionId123';
    const res = await logout({ sessionId });
    expect(res.success).toBe(true);
    expect(deleteSession).toHaveBeenCalledWith(sessionId);
});
