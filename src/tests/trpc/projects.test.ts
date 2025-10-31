import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getQueryClient, trpc } from '@/lib/trpc/server-client';

const employee = { id: 'u1', role: 'EMPLOYEE', projectId: 'u1p1' } as const;
const manager = { id: 'u2', role: 'MANAGER', projectId: 'u2p1' } as const;
const owner = { id: 'u3', role: 'OWNER', projectId: 'u3p1' } as const;
const orgId = 'oid';

const mockedGetSession = getSession as jest.Mock;
const queryClient = getQueryClient();

afterEach(() => {
    queryClient.clear();
});

test('projects setup', async () => {
    const users = [employee, manager, owner];
    const organization = await prisma.organization.create({ data: { name: '', currency: 'EUR', id: orgId } });

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
                        role: user.role,
                        organizationId: organization.id,
                        Projects: { create: { color: 'BLUE', name: '', id: user.projectId, organizationId: orgId } },
                    },
                },
            },
        });
    }
});

test('returns empty array for unauthenticated users', async () => {
    expect(await queryClient.fetchQuery(trpc.projects.queryOptions({ orgId }))).toEqual([]);
});

test('employee can get his projects', async () => {
    const { id, projectId } = employee;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.projects.queryOptions({ orgId }));

    expect(res.length).toBe(1);
    expect(res[0].id).toBe(projectId);
});

test('manager can get all projects', async () => {
    const { id } = manager;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.projects.queryOptions({ orgId }));

    expect(res.length).toBe(3);
});

test('owner can get all projects', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.projects.queryOptions({ orgId }));

    expect(res.length).toBe(3);
});
