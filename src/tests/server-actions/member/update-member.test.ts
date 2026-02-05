import { prisma } from '@/lib/prisma';
import { updateMember } from '@/lib/server-actions/member';
import { mockSession } from '@/tests/utils/mock-session';

const owner = { id: 'idOwner', memberId: 'idOwnerMember' };
const manager = { id: 'idManager', memberId: 'idManagerMember' };
const emp1 = { id: 'idEmp1', memberId: 'idEmp1Member' };
const emp2 = { id: 'idEmp2', memberId: 'idEmp2Member' };
const organizationId = 'organizationId123';

const memberPrisma = async (id: string) => await prisma.member.findUnique({ where: { id }, include: { HourlyRates: true } });

beforeEach(async () => {
    await prisma.user.createMany({
        data: [
            { email: '1', name: '', password: '', id: owner.id },
            { email: '2', name: '', password: '', id: manager.id },
            { email: '3', name: '', password: '', id: emp1.id },
            { email: '4', name: '', password: '', id: emp2.id },
        ],
    });

    await prisma.organization.create({
        data: {
            id: organizationId,
            name: 'o',
            currency: 'EUR',
            Members: {
                createMany: {
                    data: [
                        { role: 'OWNER', userId: owner.id, id: owner.memberId },
                        { role: 'MANAGER', userId: manager.id, id: manager.memberId },
                        { role: 'EMPLOYEE', userId: emp1.id, id: emp1.memberId },
                        { role: 'EMPLOYEE', userId: emp2.id, id: emp2.memberId },
                    ],
                },
            },
        },
    });
});

test('employee can not updateMember', async () => {
    mockSession(emp1.id);
    const res = await updateMember({ memberId: emp2.memberId, hourlyRate: 24 });
    expect(res.success).toBe(false);
    const member = await memberPrisma(emp2.memberId);
    expect(member?.HourlyRates.length).toBe(0);
});

test('manager can updateMember', async () => {
    mockSession(manager.id);
    const res = await updateMember({ memberId: emp2.memberId, hourlyRate: 24 });
    expect(res.success).toBe(true);
    const member = await memberPrisma(emp2.memberId);
    expect(member?.HourlyRates.length).toBe(1);
});

test('owner can updateMember', async () => {
    mockSession(owner.id);

    await updateMember({ memberId: emp2.memberId, hourlyRate: 24 });

    mockSession(owner.id);
    const res = await updateMember({ memberId: emp2.memberId, hourlyRate: 50 });

    expect(res.success).toBe(true);
    const member = await memberPrisma(emp2.memberId);
    expect(member?.HourlyRates.length).toBe(2);
});

test('manager can change employee/manager role', async () => {
    mockSession(manager.id);
    const res = await updateMember({ memberId: emp2.memberId, role: 'MANAGER' });
    expect(res.success).toBe(true);
    const member = await memberPrisma(emp2.memberId);
    expect(member?.role).toBe('MANAGER');
});

test('no one can assign owner role', async () => {
    const users = [manager, emp1, owner];

    for (const user of users) {
        mockSession(user.id);
        await updateMember({ memberId: emp2.memberId, role: 'OWNER' });
    }

    const member = await memberPrisma(emp2.memberId);
    expect(member?.role).toBe('EMPLOYEE');
});

test('no one can change owners role', async () => {
    const users = [manager, emp1, owner];

    for (const user of users) {
        mockSession(user.id);
        await updateMember({ memberId: owner.memberId, role: 'MANAGER' });
    }

    const member = await memberPrisma(owner.memberId);
    expect(member?.role).toBe('OWNER');
});
