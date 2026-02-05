import { prisma } from '@/lib/prisma';
import { getQueryClient, trpc } from '@/lib/trpc/server-client';
import { mockSession } from '../utils/mock-session';

const user1 = { id: 'u1Id', memberId: 'u1mId', timeEntryId: 'u1teId' };
const user2 = { id: 'u2Id', memberId: 'u2mId', timeEntryId: null };

const queryClient = getQueryClient();

beforeEach(async () => {
    queryClient.clear();

    const organization = await prisma.organization.create({
        data: { currency: 'EUR', name: 'Test Org' },
    });

    const users = [user1, user2];
    for (const [index, user] of users.entries()) {
        await prisma.user.create({
            data: {
                email: `test-${index}@example.com`,
                name: `User ${index}`,
                password: 'password',
                id: user.id,
                Members: {
                    create: {
                        id: user.memberId,
                        organizationId: organization.id,
                        role: 'EMPLOYEE',

                        ...(user.timeEntryId && {
                            TimeEntries: {
                                create: [
                                    {
                                        id: user.timeEntryId,
                                        name: 'Active Task',
                                        start: new Date(),
                                        organizationId: organization.id,
                                    },
                                ],
                            },
                        }),
                    },
                },
            },
        });
    }
});

test('returns null for unauthenticated users', async () => {
    const res = await queryClient.fetchQuery(trpc.activeTimeEntry.queryOptions({ memberId: user1.memberId }));
    expect(res).toBeNull();
});

test('user1 can get his active timeEntry', async () => {
    mockSession(user1.id);
    const res = await queryClient.fetchQuery(trpc.activeTimeEntry.queryOptions({ memberId: user1.memberId }));
    expect(res?.id).toBe(user1.timeEntryId);
});

test('user2 has no active timeEntry', async () => {
    mockSession(user2.id);
    const res = await queryClient.fetchQuery(trpc.activeTimeEntry.queryOptions({ memberId: user2.memberId }));

    expect(res).toBeNull();
});
