import { dayjs } from '@/lib/dayjs';
import { prisma } from '@/lib/prisma';

import { getQueryClient, trpc } from '@/lib/trpc/server-client';
import { mockSession } from '../utils/mock-session';

const employee = {
    id: 'u1Id',
    memberId: 'u1mId',
    role: 'EMPLOYEE' as const,
    timeEntry: {
        id: 'u1teId',
        name: 'employeeEntry',
        start: dayjs().subtract(6, 'h').toDate(),
        end: dayjs().subtract(5, 'h').toDate(),
    },
    projectId: 'u1pId',
};

const manager = {
    id: 'u2Id',
    memberId: 'u2mId',
    role: 'MANAGER' as const,
    timeEntry: {
        name: 'managerEntry',
        id: 'u2teId',
        start: dayjs().subtract(5, 'h').toDate(),
        end: dayjs().subtract(4, 'h').toDate(),
    },
    projectId: 'u2pId',
};

const owner = {
    id: 'u3Id',
    memberId: 'u3mId',
    role: 'OWNER' as const,
    timeEntry: {
        name: 'ownerEntry',
        id: 'u3teId',
        start: dayjs().subtract(4, 'h').toDate(),
        end: dayjs().subtract(3, 'h').toDate(),
    },
    projectId: 'u3pId',
};

const orgId = 'oid';

const queryClient = getQueryClient();

beforeEach(async () => {
    queryClient.clear();

    await prisma.organization.create({
        data: { currency: 'EUR', name: 'Test Org', id: orgId },
    });

    const users = [employee, manager, owner];

    for (const [index, user] of users.entries()) {
        await prisma.user.create({
            data: {
                email: `user-${index}@test.com`,
                name: `User ${index}`,
                password: 'password',
                id: user.id,
                Members: {
                    create: {
                        id: user.memberId,
                        organizationId: orgId,
                        role: user.role,
                        Projects: {
                            create: {
                                color: 'BLUE',
                                name: `Project ${index}`,
                                id: user.projectId,
                                organizationId: orgId,
                                shortName: `tebm-${index}`,
                            },
                        },
                        TimeEntries: {
                            create: [
                                {
                                    name: user.timeEntry.name,
                                    start: user.timeEntry.start,
                                    end: user.timeEntry.end,
                                    id: user.timeEntry.id,
                                    organizationId: orgId,
                                    projectId: user.projectId,
                                },
                            ],
                        },
                    },
                },
            },
        });
    }
});

test('returns null for unauthenticated users', async () => {
    const res = await queryClient.fetchQuery(trpc.timeEntriesByMember.queryOptions({ orgId }));
    expect(res).toEqual([]);
});

test('employee can get his timeEntries', async () => {
    mockSession(employee.id);
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesByMember.queryOptions({
            orgId,
            members: [manager.memberId, employee.memberId, owner.memberId],
        }),
    );

    expect(res).toHaveLength(1);
    expect(res[0].id).toBe(employee.memberId);
});

test('manager can get others timeEntries', async () => {
    mockSession(manager.id);
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesByMember.queryOptions({
            orgId,
            members: [manager.memberId, employee.memberId, owner.memberId],
        }),
    );

    expect(res).toHaveLength(3);
});

test('owner can get others timeEntries', async () => {
    mockSession(owner.id);
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesByMember.queryOptions({
            orgId,
            members: [manager.memberId, employee.memberId, owner.memberId],
        }),
    );

    expect(res).toHaveLength(3);
});

test('members arg works - timeEntries', async () => {
    mockSession(owner.id);
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesByMember.queryOptions({
            orgId,
            members: [employee.memberId, owner.memberId],
        }),
    );

    expect(res).toHaveLength(2);
    res.forEach((member) => {
        expect([employee.memberId, owner.memberId]).toContain(member.id);
    });
});

test('members all arg works - timeEntries', async () => {
    mockSession(owner.id);
    const res1 = await queryClient.fetchQuery(trpc.timeEntriesByMember.queryOptions({ orgId }));
    expect(res1).toHaveLength(1);

    mockSession(owner.id);
    const res2 = await queryClient.fetchQuery(trpc.timeEntriesByMember.queryOptions({ orgId, members: 'all' }));
    expect(res2).toHaveLength(3);
});

test('projects arg works - timeEntries', async () => {
    mockSession(owner.id);
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesByMember.queryOptions({
            orgId,
            members: [employee.memberId, owner.memberId, manager.memberId],
            projectIds: [employee.projectId, manager.projectId],
        }),
    );

    const entries = res.flatMap((e) => e.TimeEntries);
    expect(entries).toHaveLength(2);
    entries.forEach((timeEntry) => {
        expect([employee.projectId, manager.projectId]).toContain(timeEntry.projectId);
    });
});

test('projects arg employee permission - timeEntries', async () => {
    mockSession(employee.id);
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesByMember.queryOptions({
            orgId,
            members: [employee.memberId, owner.memberId, manager.memberId],
            projectIds: [employee.projectId, manager.projectId],
        }),
    );

    expect(res).toHaveLength(1);
    expect(res[0].TimeEntries[0].projectId).toBe(employee.projectId);
});

test('startDate, endDate arg works - timeEntries', async () => {
    mockSession(owner.id);
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesByMember.queryOptions({
            orgId,
            members: [employee.memberId, owner.memberId, manager.memberId],
            startDate: dayjs().subtract(6, 'h').subtract(30, 'minutes').toDate().toISOString(),
            endDate: dayjs().subtract(3, 'h').subtract(30, 'minutes').toDate().toISOString(),
        }),
    );

    const entries = res.flatMap((e) => e.TimeEntries);
    expect(entries).toHaveLength(2);
    entries.forEach((timeEntry) => {
        expect([employee.timeEntry.id, manager.timeEntry.id]).toContain(timeEntry.id);
    });
});
