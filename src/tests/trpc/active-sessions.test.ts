import { prisma } from '@/lib/prisma';

import { getQueryClient, trpc } from '@/lib/trpc/server-client';
import dayjs from 'dayjs';
import { mockSession } from '../utils/mock-session';

const user1 = { id: 'u1', activeSessions: ['u1s1', 'u1s2'] };
const user2 = { id: 'u2', activeSessions: ['u2s1'] };

const queryClient = getQueryClient();

beforeEach(async () => {
    queryClient.clear();

    const users = [user1, user2];
    for (const [index, user] of users.entries()) {
        await prisma.user.create({
            data: {
                email: `user${index}@example.com`,
                name: `User ${index}`,
                password: 'password',
                id: user.id,
                Session: {
                    createMany: {
                        data: user.activeSessions.map((sId) => ({
                            expiresAt: dayjs().add(1, 'day').toDate(),
                            userAgent: 'test-agent',
                            id: sId,
                        })),
                    },
                },
            },
        });
    }
});

test('returns empty array for unauthenticated users', async () => {
    const res = await queryClient.fetchQuery(trpc.activeSessions.queryOptions());
    expect(res).toEqual([]);
});

test('user1 can get his active sessions', async () => {
    mockSession(user1.id);
    const res = await queryClient.fetchQuery(trpc.activeSessions.queryOptions());

    expect(res).toHaveLength(user1.activeSessions.length);
    res.forEach((session) => {
        expect(session.userId).toBe(user1.id);
        expect(user1.activeSessions).toContain(session.id);
    });
});

test('user2 can get his active sessions', async () => {
    mockSession(user2.id);
    const res = await queryClient.fetchQuery(trpc.activeSessions.queryOptions());

    expect(res).toHaveLength(user2.activeSessions.length);
    res.forEach((session) => {
        expect(session.userId).toBe(user2.id);
        expect(user2.activeSessions).toContain(session.id);
    });
});
