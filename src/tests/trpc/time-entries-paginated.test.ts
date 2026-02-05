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
                email: `paginated-user-${index}@test.com`,
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
                                shortName: `pag-${index}`,
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

test('returns empty array for unauthenticated users', async () => {
    const res = await queryClient.fetchQuery(trpc.timeEntriesPaginated.queryOptions({ orgId }));
    expect(res.data).toEqual([]);
});

test('employee can get his timeEntries', async () => {
    mockSession(employee.id);
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            orgId,
            members: [manager.memberId, employee.memberId, owner.memberId],
        }),
    );
    expect(res.data).toHaveLength(1);
    expect(res.data[0].id).toBe(employee.timeEntry.id);
});

test('manager can get others timeEntries', async () => {
    mockSession(manager.id);
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            orgId,
            members: [manager.memberId, employee.memberId, owner.memberId],
        }),
    );
    expect(res.data).toHaveLength(3);
});

test('owner can get others timeEntries', async () => {
    mockSession(owner.id);
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            orgId,
            members: [manager.memberId, employee.memberId, owner.memberId],
        }),
    );
    expect(res.data).toHaveLength(3);
});

test('members all arg works - timeEntries', async () => {
    mockSession(owner.id);
    const res1 = await queryClient.fetchQuery(trpc.timeEntriesPaginated.queryOptions({ orgId }));
    expect(res1.data).toHaveLength(1);

    mockSession(owner.id);
    const res2 = await queryClient.fetchQuery(trpc.timeEntriesPaginated.queryOptions({ orgId, members: 'all' }));
    expect(res2.data).toHaveLength(3);
});

test('limit arg works - timeEntries', async () => {
    mockSession(owner.id);

    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            orgId,
            limit: 2,
            members: [manager.memberId, employee.memberId, owner.memberId],
        }),
    );

    expect(res.data).toHaveLength(2);
});

test('page arg works - timeEntries', async () => {
    mockSession(owner.id);
    const page1 = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({ orgId, limit: 1, page: 1, members: [manager.memberId, employee.memberId] }),
    );
    expect(page1.data.length).toBe(1);
    expect(page1.page).toBe(1);

    mockSession(owner.id);
    const page2 = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({ orgId, limit: 1, page: 2, members: [manager.memberId, employee.memberId] }),
    );
    expect(page2.data.length).toBe(1);
    expect(page2.data[0].id).not.toBe(page1.data[0].id);
});

test('order arg works - timeEntries', async () => {
    mockSession(owner.id);
    const desc = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            orgId,
            members: [manager.memberId, employee.memberId],
            order_column: 'name',
            order_direction: 'desc',
        }),
    );
    expect(desc.data.length).toBe(2);
    expect(desc.data[0].name).toBe('managerEntry');
    expect(desc.data[1].name).toBe('employeeEntry');

    //asc
    mockSession(owner.id);
    const asc = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            orgId,
            members: [manager.memberId, employee.memberId],
            order_column: 'name',
            order_direction: 'asc',
        }),
    );
    expect(asc.data.length).toBe(2);
    expect(asc.data[0].name).toBe('employeeEntry');
    expect(asc.data[1].name).toBe('managerEntry');
});

test('members arg works - timeEntries', async () => {
    mockSession(owner.id);
    const res = await queryClient.fetchQuery(trpc.timeEntriesPaginated.queryOptions({ orgId, members: [employee.memberId, owner.memberId] }));
    expect(res.data.length).toBe(2);
    res.data.forEach((timeEntry) => {
        expect([employee.timeEntry.id, owner.timeEntry.id].includes(timeEntry.id)).toBe(true);
    });
});

test('projects arg works - timeEntries', async () => {
    mockSession(owner.id);
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            orgId,
            members: [employee.memberId, owner.memberId, manager.memberId],
            projects: [employee.projectId, manager.projectId],
        }),
    );
    expect(res.data.length).toBe(2);
    res.data.forEach((timeEntry) => {
        expect([employee.projectId, manager.projectId].includes(timeEntry.projectId!)).toBe(true);
    });
});

test('projects arg employee permission - timeEntries', async () => {
    mockSession(employee.id);
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            orgId,
            members: [employee.memberId, owner.memberId, manager.memberId],
            projects: [employee.projectId, manager.projectId],
        }),
    );
    expect(res.data.length).toBe(1);
    expect(res.data[0].projectId).toBe(employee.projectId);
});

test('takeAll arg works - timeEntries', async () => {
    mockSession(owner.id);
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            orgId,
            limit: 1,
            takeAll: true,
            members: [employee.memberId, owner.memberId, manager.memberId],
        }),
    );
    expect(res.data.length).toBe(3);
});

test('startDate, endDate arg works - timeEntries', async () => {
    mockSession(owner.id);
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            orgId,
            members: [employee.memberId, owner.memberId, manager.memberId],
            startDate: dayjs().subtract(6, 'h').subtract(30, 'minutes').toDate().toString(),
            endDate: dayjs().subtract(3, 'h').subtract(30, 'minutes').toDate().toString(),
        }),
    );
    expect(res.data.length).toBe(2);
    res.data.forEach((timeEntry) => {
        expect([employee.timeEntry.id, manager.timeEntry.id].includes(timeEntry.id)).toBe(true);
    });
});

test('query arg works - timeEntries', async () => {
    mockSession(owner.id);
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            orgId,
            members: [employee.memberId, owner.memberId, manager.memberId],
            q: 'emplo',
        }),
    );
    expect(res.data.length).toBe(1);
    expect(res.data[0].id).toBe(employee.timeEntry.id);
});
