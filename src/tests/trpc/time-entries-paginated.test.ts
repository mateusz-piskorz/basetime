import { dayjs } from '@/lib/dayjs';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getQueryClient, trpc } from '@/lib/trpc/server-client';

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

const organizationId = 'oid';

const mockedGetSession = getSession as jest.Mock;
const queryClient = getQueryClient();

afterEach(() => {
    queryClient.clear();
});

test('time-entries-paginated setup', async () => {
    await prisma.organization.create({ data: { currency: 'EUR', name: '', id: organizationId } });
    const users = [employee, manager, owner];

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
                        organizationId: organizationId,
                        role: user.role,
                        Projects: { create: { color: 'BLUE', name: '', id: user.projectId, organizationId } },
                        TimeEntries: {
                            create: [
                                {
                                    name: user.timeEntry.name,
                                    start: user.timeEntry.start,
                                    end: user.timeEntry.end,
                                    id: user.timeEntry.id,
                                    organizationId,
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
    expect((await queryClient.fetchQuery(trpc.timeEntriesPaginated.queryOptions({ organizationId }))).data).toEqual([]);
});

test('employee can get his timeEntries', async () => {
    const { id, timeEntry } = employee;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({ organizationId, memberIds: [manager.memberId, employee.memberId, owner.memberId] }),
    );

    expect(res.data.length).toBe(1);
    expect(res.data[0].id).toBe(timeEntry.id);
});

test('manager can get others timeEntries', async () => {
    const { id } = manager;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({ organizationId, memberIds: [manager.memberId, employee.memberId, owner.memberId] }),
    );

    expect(res.data.length).toBe(3);
});

test('owner can get others timeEntries', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({ organizationId, memberIds: [manager.memberId, employee.memberId, owner.memberId] }),
    );

    expect(res.data.length).toBe(3);
});

test('limit arg works - timeEntries', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({ organizationId, limit: '2', memberIds: [manager.memberId, employee.memberId, owner.memberId] }),
    );

    expect(res.data.length).toBe(2);
});

test('page arg works - timeEntries', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const page1 = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({ organizationId, limit: '1', page: '1', memberIds: [manager.memberId, employee.memberId] }),
    );

    expect(page1.data.length).toBe(1);
    expect(page1.page).toBe(1);

    mockedGetSession.mockReturnValueOnce({ userId: id });
    const page2 = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({ organizationId, limit: '1', page: '2', memberIds: [manager.memberId, employee.memberId] }),
    );

    expect(page2.data.length).toBe(1);
    expect(page2.data[0].id).not.toBe(page1.data[0].id);
});

test('order arg works - timeEntries', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const desc = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            organizationId,
            memberIds: [manager.memberId, employee.memberId],
            order_column: 'name',
            order_direction: 'desc',
        }),
    );

    expect(desc.data.length).toBe(2);
    expect(desc.data[0].name).toBe('managerEntry');
    expect(desc.data[1].name).toBe('employeeEntry');

    //asc
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const asc = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            organizationId,
            memberIds: [manager.memberId, employee.memberId],
            order_column: 'name',
            order_direction: 'asc',
        }),
    );

    expect(asc.data.length).toBe(2);
    expect(asc.data[0].name).toBe('employeeEntry');
    expect(asc.data[1].name).toBe('managerEntry');
});

test('members arg works - timeEntries', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({ organizationId, memberIds: [employee.memberId, owner.memberId] }),
    );

    expect(res.data.length).toBe(2);
    res.data.forEach((timeEntry) => {
        [employee.timeEntry.id, owner.timeEntry.id].includes(timeEntry.id);
    });
});

test('projects arg works - timeEntries', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            organizationId,
            memberIds: [employee.memberId, owner.memberId, manager.memberId],
            projectIds: [employee.projectId, manager.projectId],
        }),
    );

    expect(res.data.length).toBe(2);
    res.data.forEach((timeEntry) => {
        [employee.projectId, manager.projectId].includes(timeEntry.projectId!);
    });
});

test('projects arg employee permission - timeEntries', async () => {
    const { id } = employee;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            organizationId,
            memberIds: [employee.memberId, owner.memberId, manager.memberId],
            projectIds: [employee.projectId, manager.projectId],
        }),
    );

    expect(res.data.length).toBe(1);
    expect(res.data[0].projectId).toBe(employee.projectId);
});

test('takeAll arg works - timeEntries', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            organizationId,
            limit: '1',
            takeAll: true,
            memberIds: [employee.memberId, owner.memberId, manager.memberId],
        }),
    );

    expect(res.data.length).toBe(3);
});

test('startDate, endDate arg works - timeEntries', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            organizationId,
            memberIds: [employee.memberId, owner.memberId, manager.memberId],
            startDate: dayjs().subtract(6, 'h').subtract(30, 'minutes').toDate().toString(),
            endDate: dayjs().subtract(3, 'h').subtract(30, 'minutes').toDate().toString(),
        }),
    );

    expect(res.data.length).toBe(2);
    res.data.forEach((timeEntry) => {
        [employee.timeEntry.id, manager.timeEntry.id].includes(timeEntry.id);
    });
});

test('query arg works - timeEntries', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesPaginated.queryOptions({
            organizationId,
            memberIds: [employee.memberId, owner.memberId, manager.memberId],
            q: 'emplo',
        }),
    );

    expect(res.data.length).toBe(1);
    expect(res.data[0].id).toBe(employee.timeEntry.id);
});
