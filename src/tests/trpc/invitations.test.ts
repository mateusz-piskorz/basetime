import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getQueryClient, trpc } from '@/lib/trpc/server-client';

const employee = { id: 'u1', role: 'EMPLOYEE' } as const;
const manager = { id: 'u2', role: 'MANAGER' } as const;
const owner = { id: 'u3', role: 'OWNER' } as const;
const user1 = { id: 'u4' };
const user2 = { id: 'u5' };
const organizationId = 'oid';

const mockedGetSession = getSession as jest.Mock;
const queryClient = getQueryClient();

afterEach(() => {
    queryClient.clear();
});

test('invitations setup', async () => {
    const users = [employee, manager, owner, user1, user2];
    const organization = await prisma.organization.create({ data: { name: 'organization1', currency: 'EUR', id: organizationId } });

    for (const index in users) {
        const user = users[index];

        await prisma.user.create({
            data: {
                email: index,
                name: index,
                password: index,
                id: user.id,
                ...('role' in user && {
                    Members: {
                        create: {
                            role: user.role,
                            organizationId: organization.id,
                        },
                    },
                }),
            },
        });
    }

    await prisma.invitation.create({ data: { organizationId, userId: user1.id, status: 'CANCELED' } });
    await prisma.invitation.create({ data: { organizationId, userId: user1.id, status: 'SENT' } });
});

test('returns empty array for unauthenticated users', async () => {
    expect((await queryClient.fetchQuery(trpc.invitations.queryOptions({ organizationId }))).data).toEqual([]);
});

test('employee cannot see invitations', async () => {
    const { id } = employee;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.invitations.queryOptions({ organizationId }));

    expect(res.data.length).toBe(0);
});

test('random user cannot see invitations', async () => {
    const { id } = user2;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.invitations.queryOptions({}));

    expect(res.data.length).toBe(0);
});

test('invited user can see invitation', async () => {
    const { id } = user1;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.invitations.queryOptions({}));

    expect(res.data.length).toBe(2);
});

test('manager can see invitations', async () => {
    const { id } = manager;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.invitations.queryOptions({ organizationId }));

    expect(res.data.length).toBe(2);
});

test('owner can see invitations', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.invitations.queryOptions({ organizationId }));

    expect(res.data.length).toBe(2);
});

test('invitations filtered by status', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.invitations.queryOptions({ organizationId, status: ['SENT'] }));

    expect(res.data.length).toBe(1);
    expect(res.data[0].status).toBe('SENT');
});

test('invitations query filter', async () => {
    const { id } = user1;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.invitations.queryOptions({ q: 'incorrect query', queryColumn: 'ORGANIZATION_NAME' }));
    expect(res.data.length).toBe(0);

    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res2 = await queryClient.fetchQuery(trpc.invitations.queryOptions({ q: 'organiz', queryColumn: 'ORGANIZATION_NAME' }));
    expect(res2.data.length).toBe(2);
});

test('invitations pagination', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const page1 = await queryClient.fetchQuery(trpc.invitations.queryOptions({ organizationId, limit: 1, page: 1 }));

    expect(page1.data.length).toBe(1);

    mockedGetSession.mockReturnValueOnce({ userId: id });
    const page2 = await queryClient.fetchQuery(trpc.invitations.queryOptions({ organizationId, limit: 1, page: 2 }));
    expect(page2.data.length).toBe(1);
    expect(page2.data[0].id).not.toBe(page1.data[0].id);
});

test('invitations orderBy', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const desc = await queryClient.fetchQuery(trpc.invitations.queryOptions({ organizationId, order_column: 'status', order_direction: 'desc' }));
    const [desc1, desc2] = desc.data;
    // it's by enum index, not alphabetically
    expect(desc1.status).toBe('CANCELED');
    expect(desc2.status).toBe('SENT');

    mockedGetSession.mockReturnValueOnce({ userId: id });
    const asc = await queryClient.fetchQuery(trpc.invitations.queryOptions({ organizationId, order_column: 'status', order_direction: 'asc' }));
    const [asc1, asc2] = asc.data;
    expect(asc1.status).toBe('SENT');
    expect(asc2.status).toBe('CANCELED');
});
