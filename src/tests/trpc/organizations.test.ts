import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getQueryClient, trpc } from '@/lib/trpc/server-client';

const employee = { id: 'u1', role: 'EMPLOYEE', organizationId: 'u1o' } as const;
const manager = { id: 'u2', role: 'MANAGER', organizationId: 'u2o' } as const;
const owner = { id: 'u3', role: 'OWNER', organizationId: 'u3o' } as const;
const commonOrganizationId = 'coid';

const mockedGetSession = getSession as jest.Mock;
const queryClient = getQueryClient();

afterEach(() => {
    queryClient.clear();
});

test('organizations setup', async () => {
    const users = [employee, manager, owner];
    await prisma.organization.create({ data: { name: '', currency: 'EUR', id: commonOrganizationId } });

    for (const index in users) {
        const user = users[index];

        await prisma.user.create({
            data: {
                email: index,
                name: index,
                password: index,
                id: user.id,
                Members: { create: { role: user.role, organizationId: commonOrganizationId } },
            },
        });

        await prisma.organization.create({
            data: {
                name: '',
                currency: 'EUR',
                id: user.organizationId,
                Members: { create: { userId: user.id, role: 'OWNER' } },
            },
        });
    }
});

test('returns empty array for unauthenticated users', async () => {
    expect(await queryClient.fetchQuery(trpc.organizations.queryOptions({}))).toEqual([]);
});

test('employee can get organization by id', async () => {
    const { id, organizationId } = employee;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.organizations.queryOptions({ organizationId }));

    expect(res.length).toBe(1);
    expect(res[0].id).toBe(organizationId);
    expect(res[0].Members[0].userId).toBe(id);
    expect(res[0]?.ownership).toBe(true);
});

test('limit arg works', async () => {
    const { id } = employee;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.organizations.queryOptions({}));
    expect(res.length).toBe(2);

    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res2 = await queryClient.fetchQuery(trpc.organizations.queryOptions({ limit: 1 }));
    expect(res2.length).toBe(1);
});

test('employee can get his organizations', async () => {
    const { id, organizationId, role } = employee;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.organizations.queryOptions({}));

    expect(res.length).toBe(2);

    const commonOrganization = res.find(({ id }) => id === commonOrganizationId);
    const commonOrganizationMember = commonOrganization?.Members.find((e) => e.userId === id);
    expect(commonOrganizationMember?.role).toBe(role);
    expect(commonOrganization?.ownership).toBe(false);

    const userOrganization = res.find(({ id }) => id === organizationId);
    const userOrganizationMember = userOrganization?.Members[0];
    expect(userOrganizationMember?.userId).toBe(id);
    expect(userOrganization?.ownership).toBe(true);
});

test('manager can get his organizations', async () => {
    const { id, organizationId, role } = manager;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.organizations.queryOptions({}));

    expect(res.length).toBe(2);

    const commonOrganization = res.find(({ id }) => id === commonOrganizationId);
    const commonOrganizationMember = commonOrganization?.Members.find((e) => e.userId === id);
    expect(commonOrganizationMember?.role).toBe(role);
    expect(commonOrganization?.ownership).toBe(false);

    const userOrganization = res.find(({ id }) => id === organizationId);
    const userOrganizationMember = userOrganization?.Members[0];
    expect(userOrganizationMember?.userId).toBe(id);
    expect(userOrganization?.ownership).toBe(true);
});

test('owner can get his organizations', async () => {
    const { id, organizationId, role } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.organizations.queryOptions({}));

    expect(res.length).toBe(2);

    const commonOrganization = res.find(({ id }) => id === commonOrganizationId);
    const commonOrganizationMember = commonOrganization?.Members.find((e) => e.userId === id);
    expect(commonOrganizationMember?.role).toBe(role);
    expect(commonOrganization?.ownership).toBe(true);

    const userOrganization = res.find(({ id }) => id === organizationId);
    const userOrganizationMember = userOrganization?.Members[0];
    expect(userOrganizationMember?.userId).toBe(id);
    expect(userOrganization?.ownership).toBe(true);
});
