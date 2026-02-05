import { prisma } from '@/lib/prisma';

import { getQueryClient, trpc } from '@/lib/trpc/server-client';
import { mockSession } from '../utils/mock-session';

const employee = { id: 'u1', role: 'EMPLOYEE', projectId: 'u1p1' } as const;
const manager = { id: 'u2', role: 'MANAGER', projectId: 'u2p1' } as const;
const owner = { id: 'u3', role: 'OWNER', projectId: 'u3p1' } as const;
const orgId = 'oid';

const queryClient = getQueryClient();

beforeEach(async () => {
    queryClient.clear();

    const organization = await prisma.organization.create({
        data: { name: 'Test Org', currency: 'EUR', id: orgId },
    });

    const users = [employee, manager, owner];

    for (const [index, user] of users.entries()) {
        await prisma.user.create({
            data: {
                email: `user-${index}@example.com`,
                name: `User ${index}`,
                password: 'password',
                id: user.id,
                Members: {
                    create: {
                        role: user.role,
                        organizationId: organization.id,
                        Projects: {
                            create: {
                                color: 'BLUE',
                                name: `Project ${index}`,
                                id: user.projectId,
                                organizationId: orgId,
                                shortName: `ptt-${index}`,
                            },
                        },
                    },
                },
            },
        });
    }
});

test('returns empty array for unauthenticated users', async () => {
    const res = await queryClient.fetchQuery(trpc.projects.queryOptions({ orgId }));
    expect(res).toEqual([]);
});

test('employee can get his projects', async () => {
    mockSession(employee.id);
    const res = await queryClient.fetchQuery(trpc.projects.queryOptions({ orgId }));
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe(employee.projectId);
});

test('manager can get all projects', async () => {
    mockSession(manager.id);
    const res = await queryClient.fetchQuery(trpc.projects.queryOptions({ orgId }));
    expect(res).toHaveLength(3);
});

test('owner can get all projects', async () => {
    mockSession(owner.id);
    const res = await queryClient.fetchQuery(trpc.projects.queryOptions({ orgId }));
    expect(res).toHaveLength(3);
});
