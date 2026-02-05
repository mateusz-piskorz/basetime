import { prisma } from '@/lib/prisma';
import { upsertOrg } from '@/lib/server-actions/organization';
import { mockSession } from '@/tests/utils/mock-session';
import { CURRENCY } from '@prisma/client';
import bcrypt from 'bcrypt';

const owner = { id: 'idOwner', memberId: 'idOwnerMember' };
const manager = { id: 'idManager', memberId: 'idManagerMember' };
const emp1 = { id: 'idEmp1', memberId: 'idEmp1Member' };
const emp2 = { id: 'idEmp2', memberId: 'idEmp2Member' };
const orgId = 'orgId123';

const getOrgPrisma = () => prisma.organization.findUnique({ where: { id: orgId } });

beforeEach(async () => {
    const pwHash = await bcrypt.hash('admin1234', 9);
    await prisma.user.createMany({
        data: [
            { email: '1', name: '', password: pwHash, id: owner.id },
            { email: '2', name: '', password: pwHash, id: manager.id },
            { email: '3', name: '', password: pwHash, id: emp1.id },
            { email: '4', name: '', password: pwHash, id: emp2.id },
        ],
    });

    await prisma.organization.create({
        data: {
            id: orgId,
            name: 'original',
            currency: 'EUR',
            Members: {
                createMany: {
                    data: [
                        { role: 'OWNER', userId: owner.id, id: owner.memberId },
                        { role: 'MANAGER', userId: manager.id, id: manager.memberId },
                        { role: 'EMPLOYEE', userId: emp1.id, id: emp1.memberId },
                    ],
                },
            },
        },
    });
});

describe('upsertOrg: update', () => {
    const updateOrg = (name?: string, currency?: CURRENCY) => upsertOrg({ organizationId: orgId, name, currency });

    test('employee cannot update organization', async () => {
        mockSession(emp1.id);
        const res = await updateOrg('new name');
        expect(res.success).toBe(false);
        expect((await getOrgPrisma())?.name).toBe('original');
    });

    test('manager can update organization', async () => {
        mockSession(manager.id);
        const res = await updateOrg('orgName1', 'PLN');
        expect(res.success).toBe(true);

        const org = await getOrgPrisma();
        expect(org?.name).toBe('orgName1');
        expect(org?.currency).toBe('PLN');
    });

    test('owner can update organization', async () => {
        mockSession(owner.id);
        const res = await updateOrg('orgName2', 'USD');
        expect(res.success).toBe(true);

        const org = await getOrgPrisma();
        expect(org?.name).toBe('orgName2');
    });
});

describe('upsertOrg: create', () => {
    test(`user can create its own organization`, async () => {
        mockSession(emp2.id);

        const res = await upsertOrg({ name: 'newOrg', currency: 'PLN' });
        expect(res.success).toBe(true);

        const org = await prisma.organization.findUnique({
            where: { id: res.data?.id },
            include: { Members: true },
        });

        expect(org?.name).toBe('newOrg');
        expect(org?.Members.some((m) => m.userId === emp2.id && m.role === 'OWNER')).toBe(true);
    });
});
