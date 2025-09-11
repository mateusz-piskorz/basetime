// start and stop db container between each test suit
// we probably need bable to transform ts files
import { prisma } from '@/lib/prisma';
import { updateProfile } from '@/lib/server-actions/profile';

const email = 'john@spoko.pl';
const password = 'john1234';
const name = 'john doe';
const updatedName = 'john doe2';
const id = 'id123';

jest.mock('@/lib/session', () => ({
    getSession: () => ({
        sessionId: 'dwada',
        id,
        email,
        name,
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

test('create user', async () => {
    await prisma.user.create({ data: { email, name, password, id } });
});

test('User can update profile', async () => {
    const res = await updateProfile({ data: { name: updatedName } });
    expect(res.success).toBe(true);
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user?.name).toBe(updatedName);
});
