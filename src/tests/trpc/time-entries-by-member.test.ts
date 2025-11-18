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

const orgId = 'oid';

const mockedGetSession = getSession as jest.Mock;
const queryClient = getQueryClient();

afterEach(() => {
    queryClient.clear();
});

test('time-entries-by-member setup', async () => {
    await prisma.organization.create({ data: { currency: 'EUR', name: '', id: orgId } });
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
                        organizationId: orgId,
                        role: user.role,
                        Projects: { create: { color: 'BLUE', name: '', id: user.projectId, organizationId: orgId, shortName: '2' } },
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
    expect(await queryClient.fetchQuery(trpc.timeEntriesByMember.queryOptions({ orgId }))).toEqual([]);
});

test('employee can get his timeEntries', async () => {
    const { id, memberId } = employee;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesByMember.queryOptions({ orgId, members: [manager.memberId, employee.memberId, owner.memberId] }),
    );

    expect(res.length).toBe(1);
    expect(res[0].id).toBe(memberId);
});

test('manager can get others timeEntries', async () => {
    const { id } = manager;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesByMember.queryOptions({ orgId, members: [manager.memberId, employee.memberId, owner.memberId] }),
    );

    expect(res.length).toBe(3);
});

test('owner can get others timeEntries', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesByMember.queryOptions({ orgId, members: [manager.memberId, employee.memberId, owner.memberId] }),
    );

    expect(res.length).toBe(3);
});

test('members arg works - timeEntries', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.timeEntriesByMember.queryOptions({ orgId, members: [employee.memberId, owner.memberId] }));

    expect(res.length).toBe(2);
    res.forEach((member) => {
        expect([employee.memberId, owner.memberId].includes(member.id)).toBe(true);
    });
});

test('members all arg works - timeEntries', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res1 = await queryClient.fetchQuery(trpc.timeEntriesByMember.queryOptions({ orgId }));
    expect(res1.length).toBe(1);

    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res2 = await queryClient.fetchQuery(trpc.timeEntriesByMember.queryOptions({ orgId, members: 'all' }));
    expect(res2.length).toBe(3);
});

test('projects arg works - timeEntries', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesByMember.queryOptions({
            orgId,
            members: [employee.memberId, owner.memberId, manager.memberId],
            projectIds: [employee.projectId, manager.projectId],
        }),
    );

    expect(res.flatMap((e) => e.TimeEntries).length).toBe(2);

    res.flatMap((e) => e.TimeEntries).forEach((timeEntry) => {
        expect([employee.projectId, manager.projectId].includes(timeEntry.projectId!)).toBe(true);
    });
});

test('projects arg employee permission - timeEntries', async () => {
    const { id } = employee;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesByMember.queryOptions({
            orgId,
            members: [employee.memberId, owner.memberId, manager.memberId],
            projectIds: [employee.projectId, manager.projectId],
        }),
    );

    expect(res.length).toBe(1);
    expect(res[0].TimeEntries[0].projectId).toBe(employee.projectId);
});

test('startDate, endDate arg works - timeEntries', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(
        trpc.timeEntriesByMember.queryOptions({
            orgId,
            members: [employee.memberId, owner.memberId, manager.memberId],
            startDate: dayjs().subtract(6, 'h').subtract(30, 'minutes').toDate().toString(),
            endDate: dayjs().subtract(3, 'h').subtract(30, 'minutes').toDate().toString(),
        }),
    );

    expect(res.flatMap((e) => e.TimeEntries).length).toBe(2);
    res.flatMap((e) => e.TimeEntries).forEach((timeEntry) => {
        expect([employee.timeEntry.id, manager.timeEntry.id].includes(timeEntry.id)).toBe(true);
    });
});
