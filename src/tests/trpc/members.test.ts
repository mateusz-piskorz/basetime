import { prisma } from '@/lib/prisma';
import { getQueryClient, trpc } from '@/lib/trpc/server-client';
import { mockSession } from '../utils/mock-session';

const employee = { id: 'u1', role: 'EMPLOYEE', memberId: 'u1m' } as const;
const manager = { id: 'u2', role: 'MANAGER', memberId: 'u2m' } as const;
const owner = { id: 'u3', role: 'OWNER', memberId: 'u3m' } as const;
const orgId = 'oid';
const salary = 25;

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
                email: `user${index}@example.com`,
                name: `User ${index}`,
                password: 'password',
                id: user.id,
                Members: {
                    create: {
                        id: user.memberId,
                        role: user.role,
                        organizationId: organization.id,
                        HourlyRates: {
                            create: { value: salary },
                        },
                    },
                },
            },
        });
    }
});

test('returns empty array for unauthenticated users', async () => {
    const res = await queryClient.fetchQuery(trpc.members.queryOptions({ orgId }));
    expect(res).toEqual([]);
});

test('employee can get members', async () => {
    mockSession(employee.id);
    const res = await queryClient.fetchQuery(trpc.members.queryOptions({ orgId }));

    expect(res).toHaveLength(3);
    res.forEach((member) => {
        if (member.userId === employee.id) {
            expect(member.hourlyRate).toBe(salary);
        } else {
            expect(member.hourlyRate).toBeUndefined();
        }
    });
});

test('manager can get members', async () => {
    mockSession(manager.id);
    const res = await queryClient.fetchQuery(trpc.members.queryOptions({ orgId }));
    expect(res).toHaveLength(3);
    res.forEach((member) => {
        expect(member.hourlyRate).toBe(salary);
    });
});

test('owner can get members', async () => {
    mockSession(owner.id);
    const res = await queryClient.fetchQuery(trpc.members.queryOptions({ orgId }));
    expect(res).toHaveLength(3);
    res.forEach((member) => {
        expect(member.hourlyRate).toBe(salary);
    });
});

test('hourlyRate returns latest salary', async () => {
    const newestSalary = 64;
    await prisma.member.update({
        where: { id: employee.memberId },
        data: { HourlyRates: { create: { value: newestSalary } } },
    });

    mockSession(employee.id);
    const res = await queryClient.fetchQuery(trpc.members.queryOptions({ orgId }));
    const employeeMember = res.find((e) => e.id === employee.memberId);
    expect(employeeMember?.hourlyRate).toBe(newestSalary);
});
