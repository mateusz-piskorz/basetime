import { prisma } from '@/lib/prisma';
import { getQueryClient, trpc } from '@/lib/trpc/server-client';
import { mockSession } from '../utils/mock-session';

const employee = { id: 'u1', role: 'EMPLOYEE', orgId: 'u1o' } as const;
const manager = { id: 'u2', role: 'MANAGER', orgId: 'u2o' } as const;
const owner = { id: 'u3', role: 'OWNER', orgId: 'u3o' } as const;
const commonOrganizationId = 'coid';

const queryClient = getQueryClient();

beforeEach(async () => {
    queryClient.clear();

    await prisma.organization.create({
        data: { name: 'Common Org', currency: 'EUR', id: commonOrganizationId },
    });

    const users = [employee, manager, owner];

    for (const [index, user] of users.entries()) {
        await prisma.user.create({
            data: {
                email: `user${index}@test.com`,
                name: `User ${index}`,
                password: 'password',
                id: user.id,
                Members: {
                    create: {
                        role: user.role,
                        organizationId: commonOrganizationId,
                    },
                },
            },
        });

        await prisma.organization.create({
            data: {
                name: `Private Org ${index}`,
                currency: 'EUR',
                id: user.orgId,
                Members: {
                    create: { userId: user.id, role: 'OWNER' },
                },
            },
        });
    }
});

test('returns empty array for unauthenticated users', async () => {
    const res = await queryClient.fetchQuery(trpc.organizations.queryOptions({}));
    expect(res).toEqual([]);
});

test('employee can get organization by id', async () => {
    mockSession(employee.id);
    const res = await queryClient.fetchQuery(trpc.organizations.queryOptions({ orgId: employee.orgId }));

    expect(res).toHaveLength(1);
    expect(res[0].id).toBe(employee.orgId);
    expect(res[0].Members[0].userId).toBe(employee.id);
    expect(res[0]?.ownership).toBe(true);
});

test('limit arg works', async () => {
    mockSession(employee.id);

    const res = await queryClient.fetchQuery(trpc.organizations.queryOptions({}));
    expect(res).toHaveLength(2);

    mockSession(employee.id);
    const res2 = await queryClient.fetchQuery(trpc.organizations.queryOptions({ limit: 1 }));
    expect(res2).toHaveLength(1);
});

test('employee can get his organizations', async () => {
    mockSession(employee.id);
    const res = await queryClient.fetchQuery(trpc.organizations.queryOptions({}));

    expect(res).toHaveLength(2);

    const commonOrg = res.find(({ id }) => id === commonOrganizationId);
    const commonMember = commonOrg?.Members.find((e) => e.userId === employee.id);
    expect(commonMember?.role).toBe(employee.role);
    expect(commonOrg?.ownership).toBe(false);

    const privateOrg = res.find(({ id }) => id === employee.orgId);
    expect(privateOrg?.Members[0].userId).toBe(employee.id);
    expect(privateOrg?.ownership).toBe(true);
});

test('manager can get his organizations', async () => {
    mockSession(manager.id);
    const res = await queryClient.fetchQuery(trpc.organizations.queryOptions({}));

    expect(res).toHaveLength(2);

    const commonOrg = res.find(({ id }) => id === commonOrganizationId);
    const commonMember = commonOrg?.Members.find((e) => e.userId === manager.id);
    expect(commonMember?.role).toBe(manager.role);
    expect(commonOrg?.ownership).toBe(false);

    const privateOrg = res.find(({ id }) => id === manager.orgId);
    expect(privateOrg?.ownership).toBe(true);
});

test('owner can get his organizations', async () => {
    mockSession(owner.id);
    const res = await queryClient.fetchQuery(trpc.organizations.queryOptions({}));

    expect(res).toHaveLength(2);

    const commonOrg = res.find(({ id }) => id === commonOrganizationId);
    const commonMember = commonOrg?.Members.find((e) => e.userId === owner.id);
    expect(commonMember?.role).toBe(owner.role);
    expect(commonOrg?.ownership).toBe(true);

    const privateOrg = res.find(({ id }) => id === owner.orgId);
    expect(privateOrg?.ownership).toBe(true);
});
