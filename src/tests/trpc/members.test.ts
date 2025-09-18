import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getQueryClient, trpc } from '@/lib/trpc/server-client';

const employee = { id: 'u1', role: 'EMPLOYEE', memberId: 'u1m' } as const;
const manager = { id: 'u2', role: 'MANAGER', memberId: 'u2m' } as const;
const owner = { id: 'u3', role: 'OWNER', memberId: 'u3m' } as const;
const organizationId = 'oid';
const salary = 25;

const mockedGetSession = getSession as jest.Mock;
const queryClient = getQueryClient();

afterEach(() => {
    queryClient.clear();
});

test('members setup', async () => {
    const users = [employee, manager, owner];
    const organization = await prisma.organization.create({ data: { name: '', currency: 'EUR', id: organizationId } });

    for (const index in users) {
        const user = users[index];

        await prisma.user.create({
            data: {
                email: index,
                name: index,
                password: index,
                id: user.id,
                Members: {
                    create: { id: user.memberId, role: user.role, organizationId: organization.id, HourlyRates: { create: { value: salary } } },
                },
            },
        });
    }
});

test('returns empty array for unauthenticated users', async () => {
    expect(await queryClient.fetchQuery(trpc.members.queryOptions({ organizationId }))).toEqual([]);
});

test('employee can get members', async () => {
    const { id } = employee;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.members.queryOptions({ organizationId }));

    expect(res.length).toBe(3);
    // employee sees only his salary
    res.forEach((member) => {
        if (member.userId === id) {
            expect(member.hourlyRate).toBe(salary);
        } else {
            expect(member.hourlyRate).toBe(undefined);
        }
    });
});

test('manager can get members', async () => {
    const { id } = manager;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.members.queryOptions({ organizationId }));

    expect(res.length).toBe(3);
    res.forEach((member) => {
        expect(member.hourlyRate).toBe(salary);
    });
});

test('owner can get members', async () => {
    const { id } = owner;
    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.members.queryOptions({ organizationId }));

    expect(res.length).toBe(3);
    res.forEach((member) => {
        expect(member.hourlyRate).toBe(salary);
    });
});

test('hourlyRate returns latest salary', async () => {
    const newestSalary = 64;
    const { id, memberId } = employee;
    await prisma.member.update({ where: { id: memberId }, data: { HourlyRates: { create: { value: newestSalary } } } });

    mockedGetSession.mockReturnValueOnce({ userId: id });
    const res = await queryClient.fetchQuery(trpc.members.queryOptions({ organizationId }));

    expect(res.length).toBe(3);
    const employeeMember = res.find((e) => e.id === memberId);
    expect(employeeMember?.hourlyRate).toBe(newestSalary);
});
