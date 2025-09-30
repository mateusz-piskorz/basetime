import { prisma } from '@/lib/prisma';
import { deleteOrg, upsertOrg } from '@/lib/server-actions/organization';
import { getSession } from '@/lib/session';
import bcrypt from 'bcrypt';

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

test('organization setup', async () => {
    const pwHash = await bcrypt.hash('admin12345', 9);
    await prisma.user.create({ data: { email: '1', name: '', password: pwHash, id: owner.id } });
    await prisma.user.create({ data: { email: '2', name: '', password: pwHash, id: manager.id } });
    await prisma.user.create({ data: { email: '3', name: '', password: pwHash, id: emp1.id } });
    await prisma.user.create({ data: { email: '4', name: '', password: pwHash, id: emp2.id } });
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

// upsertOrganization
test('employee cannot update organization', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: emp1.id });
    const res = await upsertOrg({ organizationId, name: 'dwa', currency: 'USD' });
    expect(res.success).toBe(false);
});

test('manager can update organization', async () => {
    const newName = 'new organization name';
    mockedGetSession.mockReturnValueOnce({ userId: manager.id });
    const res = await upsertOrg({ organizationId, name: newName, currency: 'PLN' });
    expect(res.success).toBe(true);
    expect(res.data?.name).toBe(newName);
    expect(res.data?.currency).toBe('PLN');
});

test('owner can update organization', async () => {
    const newName = 'new organization name1';
    mockedGetSession.mockReturnValueOnce({ userId: owner.id });
    const res = await upsertOrg({ organizationId, name: newName, currency: 'USD' });
    expect(res.success).toBe(true);
    expect(res.data?.name).toBe(newName);
    expect(res.data?.currency).toBe('USD');
});

// deleteOrganization
test('employee cannot delete organization', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: emp1.id });
    const res = await deleteOrg({ organizationId, password: 'admin12345' });
    expect(res.success).toBe(false);
});

test('manager cannot delete organization', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: manager.id });
    const res = await deleteOrg({ organizationId, password: 'admin12345' });
    expect(res.success).toBe(false);
});

test('delete organization error password incorrect', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: owner.id });
    const res = await deleteOrg({ organizationId, password: 'incorrectPassword' });
    expect(res.success).toBe(false);
    expect(res.message).toBe('Error password incorrect');
});

test('owner can delete organization', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: owner.id });
    const res = await deleteOrg({ organizationId, password: 'admin12345' });
    expect(res.success).toBe(true);
    const organization = await prisma.organization.findUnique({ where: { id: organizationId } });
    expect(organization).toBe(null);
});
