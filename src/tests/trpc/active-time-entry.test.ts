import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getQueryClient, trpc } from '@/lib/trpc/server-client';

const user1 = {
    id: 'u1Id',
    memberId: 'u1mId',
    timeEntryId: 'u1teId',
};

const user2 = {
    id: 'u2Id',
    memberId: 'u2mId',
    timeEntryId: null,
};

const mockedGetSession = getSession as jest.Mock;
const queryClient = getQueryClient();

afterEach(() => {
    queryClient.clear();
});

test('active-time-entry setup', async () => {
    const organization = await prisma.organization.create({ data: { currency: 'EUR', name: '' } });
    const users = [user1, user2];
    for (const index in users) {
        const user = users[index];

        await prisma.user.create({
            data: {
                email: index,
                name: index,
                password: index,
                id: user.id,
                Members: {
                    create: {
                        id: user.memberId,
                        organizationId: organization.id,
                        role: 'EMPLOYEE',
                        ...(user.timeEntryId && {
                            TimeEntries: {
                                create: [{ name: '', start: new Date(), Organization: { connect: { id: organization.id } }, id: user.timeEntryId }],
                            },
                        }),
                    },
                },
            },
        });
    }
});

test('returns null for unauthenticated users', async () => {
    const { memberId } = user1;
    expect(await queryClient.fetchQuery(trpc.activeTimeEntry.queryOptions({ memberId }))).toEqual(null);
});

test('user1 can get his active timeEntry', async () => {
    const { id, memberId, timeEntryId } = user1;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.activeTimeEntry.queryOptions({ memberId }));

    expect(res?.id).toBe(timeEntryId);
});

test('user2 has no active timeEntry', async () => {
    const { id, memberId } = user2;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.activeTimeEntry.queryOptions({ memberId }));

    expect(res?.id).toBe(undefined);
});
