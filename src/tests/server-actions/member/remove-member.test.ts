import { prisma } from '@/lib/prisma';
import { removeMember } from '@/lib/server-actions/member';
import { mockSession } from '@/tests/utils/mock-session';

const owner = { id: 'idOwner', memberId: 'idOwnerMember' };
const manager = { id: 'idManager', memberId: 'idManagerMember' };
const emp1 = { id: 'idEmp1', memberId: 'idEmp1Member' };
const emp2 = { id: 'idEmp2', memberId: 'idEmp2Member' };
const organizationId = 'organizationId123';

const memberPrisma = async (id: string) => await prisma.member.findUnique({ where: { id } });

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

test('owner cannot be removed', async () => {
    mockSession(owner.id);
    const res = await removeMember({ memberId: owner.memberId });
    expect(res.success).toBe(false);
    expect(await memberPrisma(owner.memberId)).not.toBe(null);
});

test('employee cannot removeMember', async () => {
    mockSession(emp1.id);
    const res = await removeMember({ memberId: emp2.memberId });
    expect(res.success).toBe(false);
    expect(await memberPrisma(emp2.memberId)).not.toBe(null);
});

test('manager can removeMember', async () => {
    mockSession(manager.id);
    const res = await removeMember({ memberId: emp2.memberId });
    expect(res.success).toBe(true);
    expect(await memberPrisma(emp2.memberId)).toBe(null);
});

test('owner can removeMember', async () => {
    mockSession(owner.id);
    const res = await removeMember({ memberId: manager.memberId });
    expect(res.success).toBe(true);
    expect(await memberPrisma(manager.memberId)).toBe(null);
});
