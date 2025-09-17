import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getQueryClient, trpc } from '@/lib/trpc/server-client';
import dayjs from 'dayjs';

const user1 = { id: 'u1', activeSessions: ['u1s1', 'u1s2'] };
const user2 = { id: 'u2', activeSessions: ['u2s1'] };

const mockedGetSession = getSession as jest.Mock;
const queryClient = getQueryClient();

afterEach(() => {
    queryClient.clear();
});

test('active-sessions setup', async () => {
    const users = [user1, user2];
    for (const index in users) {
        const user = users[index];
        await prisma.user.create({
            data: {
                email: index,
                name: index,
                password: index,
                id: user.id,
                Session: {
                    createMany: { data: user.activeSessions.map((sId) => ({ expiresAt: dayjs().add(1, 'day').toDate(), userAgent: '', id: sId })) },
                },
            },
        });
    }
});

test('returns empty array for unauthenticated users', async () => {
    expect(await queryClient.fetchQuery(trpc.activeSessions.queryOptions())).toEqual([]);
});

test('user1 can get his active sessions', async () => {
    const { activeSessions, id } = user1;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.activeSessions.queryOptions());

    expect(res.length).toBe(activeSessions.length);
    res.forEach((session) => {
        expect(session.userId).toBe(id);
        expect(activeSessions.includes(session.id)).toBe(true);
    });
});

test('user2 can get his active sessions', async () => {
    const { activeSessions, id } = user2;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.activeSessions.queryOptions());

    expect(res.length).toBe(activeSessions.length);
    res.forEach((session) => {
        expect(session.userId).toBe(id);
        expect(activeSessions.includes(session.id)).toBe(true);
    });
});
