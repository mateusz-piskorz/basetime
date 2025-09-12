import { prisma } from '@/lib/prisma';
import { removeMember, updateMember } from '@/lib/server-actions/member';
import { getSession } from '@/lib/session';

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

jest.mock('@/lib/session', () => {
    const mockGetSession = jest.fn();
    mockGetSession.mockReturnValue({ userId: owner.id });
    return {
        getSession: mockGetSession,
    };
});

test('member setup', async () => {
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

const mockedGetSession = getSession as jest.Mock;

// updateMember
test('employee can not updateMember', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: emp1.id });
    const res = await updateMember({ memberId: emp2.memberId, hourlyRate: 24 });
    expect(res.success).toBe(false);
});

test('manager can updateMember', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: manager.id });
    const res = await updateMember({ memberId: emp2.memberId, hourlyRate: 24 });
    expect(res.success).toBe(true);
});

test('owner can updateMember', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: owner.id });
    const res = await updateMember({ memberId: emp2.memberId, hourlyRate: 50 });
    expect(res.success).toBe(true);
});

test('manager can change employee/manager role', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: manager.id });
    const res = await updateMember({ memberId: emp2.memberId, role: 'MANAGER' });
    expect(res.success).toBe(true);
});

test('no one can assign owner role', async () => {
    await prisma.member.update({ where: { id: emp2.memberId }, data: { role: 'EMPLOYEE' } });

    mockedGetSession.mockReturnValueOnce({ userId: manager.id });
    await updateMember({ memberId: emp2.memberId, role: 'OWNER' });

    mockedGetSession.mockReturnValueOnce({ userId: emp1.id });
    await updateMember({ memberId: emp2.memberId, role: 'OWNER' });

    mockedGetSession.mockReturnValueOnce({ userId: owner.id });
    const res = await updateMember({ memberId: emp2.memberId, role: 'OWNER' });
    expect(res.data?.role).toBe('EMPLOYEE');
});

test('no one can change owners role', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: manager.id });
    await updateMember({ memberId: owner.memberId, role: 'MANAGER' });

    mockedGetSession.mockReturnValueOnce({ userId: emp1.id });
    await updateMember({ memberId: owner.memberId, role: 'EMPLOYEE' });

    mockedGetSession.mockReturnValueOnce({ userId: owner.id });
    await updateMember({ memberId: owner.memberId, role: 'MANAGER' });

    const ownerMember = await prisma.member.findUnique({ where: { id: owner.memberId } });
    expect(ownerMember?.role).toBe('OWNER');
});

// removeMember
test('owner cannot be removed', async () => {
    const res = await removeMember({ memberId: owner.memberId });
    expect(res.success).toBe(false);
});

test('employee cannot removeMember', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: emp1.id });
    const res = await removeMember({ memberId: emp2.memberId });
    expect(res.success).toBe(false);
});

test('manager can removeMember', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: manager.id });
    const res = await removeMember({ memberId: emp2.memberId });
    expect(res.success).toBe(true);
    const user = await prisma.member.findUnique({ where: { id: emp2.memberId } });
    expect(user).toBe(null);
});

test('owner can removeMember', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: owner.id });
    const res = await removeMember({ memberId: manager.memberId });
    expect(res.success).toBe(true);
    const user = await prisma.member.findUnique({ where: { id: manager.memberId } });
    expect(user).toBe(null);
});
