import { prisma } from '@/lib/prisma';
import { getQueryClient, trpc } from '@/lib/trpc/server-client';
import { mockSession } from '../utils/mock-session';

const employee = { id: 'u1', role: 'EMPLOYEE' } as const;
const manager = { id: 'u2', role: 'MANAGER' } as const;
const owner = { id: 'u3', role: 'OWNER' } as const;
const user1 = { id: 'u4' };
const user2 = { id: 'u5' };
const orgId = 'oid';

const queryClient = getQueryClient();

beforeEach(async () => {
    queryClient.clear();

    const organization = await prisma.organization.create({
        data: { name: 'organization1', currency: 'EUR', id: orgId },
    });

    const users = [employee, manager, owner, user1, user2];

    for (const [index, user] of users.entries()) {
        await prisma.user.create({
            data: {
                email: `user${index}@test.com`,
                name: `User ${index}`,
                password: 'password',
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

    await prisma.invitation.createMany({
        data: [
            { organizationId: orgId, userId: user1.id, status: 'CANCELED' },
            { organizationId: orgId, userId: user1.id, status: 'SENT' },
        ],
    });
});

test('returns empty array for unauthenticated users', async () => {
    const res = await queryClient.fetchQuery(trpc.invitations.queryOptions({ orgId }));
    expect(res.data).toEqual([]);
});

test('employee cannot see invitations', async () => {
    mockSession(employee.id);
    const res = await queryClient.fetchQuery(trpc.invitations.queryOptions({ orgId }));
    expect(res.data).toHaveLength(0);
});

test('random user cannot see invitations', async () => {
    mockSession(user2.id);
    const res = await queryClient.fetchQuery(trpc.invitations.queryOptions({}));
    expect(res.data).toHaveLength(0);
});

test('invited user can see invitation', async () => {
    mockSession(user1.id);
    const res = await queryClient.fetchQuery(trpc.invitations.queryOptions({}));
    expect(res.data).toHaveLength(2);
});

test('manager can see invitations', async () => {
    mockSession(manager.id);
    const res = await queryClient.fetchQuery(trpc.invitations.queryOptions({ orgId }));
    expect(res.data).toHaveLength(2);
});

test('owner can see invitations', async () => {
    mockSession(owner.id);
    const res = await queryClient.fetchQuery(trpc.invitations.queryOptions({ orgId }));
    expect(res.data).toHaveLength(2);
});

test('invitations filtered by status', async () => {
    mockSession(owner.id);
    const res = await queryClient.fetchQuery(trpc.invitations.queryOptions({ orgId, status: ['SENT'] }));
    expect(res.data).toHaveLength(1);
    expect(res.data[0].status).toBe('SENT');
});

test('invitations query filter', async () => {
    mockSession(user1.id);
    const res = await queryClient.fetchQuery(trpc.invitations.queryOptions({ q: 'incorrect query', queryColumn: 'ORGANIZATION_NAME' }));
    expect(res.data).toHaveLength(0);

    mockSession(user1.id);
    const res2 = await queryClient.fetchQuery(trpc.invitations.queryOptions({ q: 'organiz', queryColumn: 'ORGANIZATION_NAME' }));
    expect(res2.data).toHaveLength(2);
});

test('invitations pagination', async () => {
    mockSession(owner.id);
    const page1 = await queryClient.fetchQuery(trpc.invitations.queryOptions({ orgId, limit: 1, page: 1 }));
    expect(page1.data).toHaveLength(1);

    mockSession(owner.id);
    const page2 = await queryClient.fetchQuery(trpc.invitations.queryOptions({ orgId, limit: 1, page: 2 }));
    expect(page2.data).toHaveLength(1);
    expect(page2.data[0].id).not.toBe(page1.data[0].id);
});

test('invitations orderBy', async () => {
    mockSession(owner.id);
    const desc = await queryClient.fetchQuery(trpc.invitations.queryOptions({ orgId, order_column: 'status', order_direction: 'desc' }));
    expect(desc.data[0].status).toBe('CANCELED');
    expect(desc.data[1].status).toBe('SENT');

    mockSession(owner.id);
    const asc = await queryClient.fetchQuery(trpc.invitations.queryOptions({ orgId, order_column: 'status', order_direction: 'asc' }));
    expect(asc.data[0].status).toBe('SENT');
    expect(asc.data[1].status).toBe('CANCELED');
});
