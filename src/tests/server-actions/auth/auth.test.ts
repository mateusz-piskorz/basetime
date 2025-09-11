// start and stop db container between each test suit
// we probably need bable to transform ts files
import { prisma } from '@/lib/prisma';
import { signup } from '@/lib/server-actions/auth';

jest.mock('@/lib/session', () => ({
    getSession: () => ({
        sessionId: 'dwada',
        id: 'ownerUserId',
        email: 'owneremail@spoko.pl',
        name: 'ownerUser',
    }),
    createSession: () => {},
    deleteSession: () => {},
    verifySession: () => {},
}));

jest.mock('server-only', () => ({}));
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

test('sing up validation works', async () => {
    const res = await signup({ email: '', password, name });
    expect(res.success).toBe(false);
});

test('User can sing up', async () => {
    const res = await signup({ email, password, name });
    expect(res.success).toBe(true);
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user?.name).toBe(name);
});
