import { signin, signup } from '@/lib/server-actions/auth';
import { createSession } from '@/lib/session';

jest.mock('next/headers', () => ({
    headers: () => ({ get: (key: string) => `MockedHeader-${key}` }),
}));

const userStub = { email: 'john@spoko.pl', password: 'john1234', name: 'john doe' };

test('User can sign in', async () => {
    await signup(userStub);
    const res = await signin({ email: userStub.email, password: userStub.password });

    expect(res.success).toBe(true);
    expect(createSession).toHaveBeenCalledTimes(2);
});
