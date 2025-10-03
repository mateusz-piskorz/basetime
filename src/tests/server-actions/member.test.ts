import { prisma } from '@/lib/prisma';
import { removeMember, updateMember } from '@/lib/server-actions/member';
import { mockSession } from '../utils/mock-session';

const owner = {
    id: 'idOwner',
    memberId: 'idOwnerMember',
};
const manager = {
    id: 'idManager',
    memberId: 'idManagerMember',
};
const emp1 = {
    id: 'idEmp1',
    memberId: 'idEmp1Member',
};
const emp2 = {
    id: 'idEmp2',
    memberId: 'idEmp2Member',
};

const organizationId = 'organizationId123';
const memberPrisma = async (id: string) => await prisma.member.findUnique({ where: { id }, include: { HourlyRates: true } });

beforeAll(async () => {
    await prisma.user.create({ data: { email: '1', name: '', password: '', id: owner.id } });
    await prisma.user.create({ data: { email: '2', name: '', password: '', id: manager.id } });
    await prisma.user.create({ data: { email: '3', name: '', password: '', id: emp1.id } });
    await prisma.user.create({ data: { email: '4', name: '', password: '', id: emp2.id } });
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

describe('removeMember', () => {
    test('owner cannot be removed', async () => {
        mockSession(owner.id);
        expect((await removeMember({ memberId: owner.memberId })).success).toBe(false);
        expect(await memberPrisma(owner.memberId)).not.toBe(null);
    });

    test('employee cannot removeMember', async () => {
        mockSession(emp1.id);
        expect((await removeMember({ memberId: emp2.memberId })).success).toBe(false);
        expect(await memberPrisma(emp2.memberId)).not.toBe(null);
    });

    test('manager can removeMember', async () => {
        mockSession(manager.id);
        expect((await removeMember({ memberId: emp2.memberId })).success).toBe(true);
        expect(await memberPrisma(emp2.memberId)).toBe(null);
    });

    test('owner can removeMember', async () => {
        mockSession(owner.id);
        expect((await removeMember({ memberId: manager.memberId })).success).toBe(true);
        expect(await memberPrisma(manager.memberId)).toBe(null);
    });
});

describe('updateMember', () => {
    beforeAll(async () => {
        await prisma.member.create({ data: { organizationId, userId: manager.id, role: 'MANAGER', id: manager.memberId } });
        await prisma.member.create({ data: { organizationId, userId: emp2.id, role: 'EMPLOYEE', id: emp2.memberId } });
    });
    test('employee can not updateMember', async () => {
        mockSession(emp1.id);
        expect((await updateMember({ memberId: emp2.memberId, hourlyRate: 24 })).success).toBe(false);
        expect((await memberPrisma(emp2.memberId))?.HourlyRates.length).toBe(0);
    });

    test('manager can updateMember', async () => {
        mockSession(manager.id);
        expect((await updateMember({ memberId: emp2.memberId, hourlyRate: 24 })).success).toBe(true);
        expect((await memberPrisma(emp2.memberId))?.HourlyRates.length).toBe(1);
    });

    test('owner can updateMember', async () => {
        mockSession(owner.id);
        expect((await updateMember({ memberId: emp2.memberId, hourlyRate: 50 })).success).toBe(true);
        expect((await memberPrisma(emp2.memberId))?.HourlyRates.length).toBe(2);
    });

    test('manager can change employee/manager role', async () => {
        mockSession(manager.id);
        expect((await updateMember({ memberId: emp2.memberId, role: 'MANAGER' })).success).toBe(true);
        expect((await memberPrisma(emp2.memberId))?.role).toBe('MANAGER');
    });

    test('no one can assign owner role', async () => {
        await prisma.member.update({ where: { id: emp2.memberId }, data: { role: 'EMPLOYEE' } });

        mockSession(manager.id);
        await updateMember({ memberId: emp2.memberId, role: 'OWNER' });

        mockSession(emp1.id);
        await updateMember({ memberId: emp2.memberId, role: 'OWNER' });

        mockSession(owner.id);
        await updateMember({ memberId: emp2.memberId, role: 'OWNER' });

        expect((await memberPrisma(emp2.memberId))?.role).toBe('EMPLOYEE');
    });

    test('no one can change owners role', async () => {
        mockSession(manager.id);
        await updateMember({ memberId: owner.memberId, role: 'MANAGER' });

        mockSession(emp1.id);
        await updateMember({ memberId: owner.memberId, role: 'EMPLOYEE' });

        mockSession(owner.id);
        await updateMember({ memberId: owner.memberId, role: 'MANAGER' });

        await prisma.member.findUnique({ where: { id: owner.memberId } });
        expect((await memberPrisma(owner.memberId))?.role).toBe('OWNER');
    });
});
