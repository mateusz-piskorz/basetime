import { prisma } from '@/lib/prisma';
import { deleteOrg as deleteOrgAction, upsertOrg } from '@/lib/server-actions/organization';
import { CURRENCY } from '@prisma/client';
import bcrypt from 'bcrypt';
import { getStatObject, uploadFile } from '../../lib/minio';
import { loadTestNonSharedBuffer } from '../utils/example-img';
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

const organizationId = 'orgId123';
const getOrgPrisma = async () => await prisma.organization.findUnique({ where: { id: organizationId } });

beforeAll(async () => {
    const pwHash = await bcrypt.hash('admin1234', 9);
    await prisma.user.create({ data: { email: '1', name: '', password: pwHash, id: owner.id } });
    await prisma.user.create({ data: { email: '2', name: '', password: pwHash, id: manager.id } });
    await prisma.user.create({ data: { email: '3', name: '', password: pwHash, id: emp1.id } });
    await prisma.user.create({ data: { email: '4', name: '', password: pwHash, id: emp2.id } });
    await prisma.organization.create({
        data: {
            id: organizationId,
            name: 'original',
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

describe('update org', () => {
    const updateOrg = async (name?: string, currency?: CURRENCY) => await upsertOrg({ organizationId, name, currency });

    test('employee cannot update organization', async () => {
        mockSession(emp1.id);
        expect((await updateOrg('new name')).success).toBe(false);
        expect((await getOrgPrisma())?.name).toBe('original');
    });

    test('manager can update organization', async () => {
        mockSession(manager.id);
        expect((await updateOrg('orgName1', 'PLN')).success).toBe(true);

        const org = await getOrgPrisma();
        expect(org?.name).toBe('orgName1');
        expect(org?.currency).toBe('PLN');
    });

    test('owner can update organization', async () => {
        mockSession(owner.id);
        expect((await updateOrg('orgName2', 'USD')).success).toBe(true);

        const org = await getOrgPrisma();
        expect(org?.name).toBe('orgName2');
        expect(org?.currency).toBe('USD');
    });
});

describe('create org', () => {
    test(`user can create it's own organization`, async () => {
        mockSession(emp2.id);

        const res = await upsertOrg({ name: 'orgName', currency: 'PLN' });
        expect(res.success).toBe(true);
        const orgs = await prisma.organization.findMany({ include: { Members: true } });
        const org = orgs.find((e) => e.id === res.data?.id);

        expect(orgs.length).toBe(2);
        expect(org?.name).toBe('orgName');
        expect(org?.currency).toBe('PLN');
        expect(org?.Members.some((e) => e.userId === emp2.id && e.role === 'OWNER')).toBe(true);
    });
});

describe('delete org', () => {
    const getOrgsPrisma = async () => await prisma.organization.findMany();
    const deleteOrg = async () => await deleteOrgAction({ organizationId, password: 'admin1234' });

    test('employee cannot delete organization', async () => {
        mockSession(emp1.id);
        expect((await deleteOrg()).success).toBe(false);
        expect((await getOrgsPrisma()).length).toBe(2);
    });

    test('manager cannot delete organization', async () => {
        mockSession(manager.id);
        expect((await deleteOrg()).success).toBe(false);
        expect((await getOrgsPrisma()).length).toBe(2);
    });

    test('error password incorrect', async () => {
        mockSession(owner.id);
        const res = await deleteOrgAction({ organizationId, password: 'incorrectPassword' });
        expect(res.success).toBe(false);
        expect(res.message).toBe('Error password incorrect');
        expect((await getOrgsPrisma()).length).toBe(2);
    });

    test('owner can delete organization', async () => {
        mockSession(owner.id);
        expect((await deleteOrg()).success).toBe(true);
        expect(await getOrgPrisma()).toBe(null);
        expect((await getOrgsPrisma()).length).toBe(1);
    });

    test('deleteOrganization also deletes logo', async () => {
        await prisma.organization.create({
            data: {
                id: organizationId,
                name: 'o',
                currency: 'EUR',
                Members: {
                    createMany: {
                        data: [{ role: 'OWNER', userId: owner.id, id: owner.memberId }],
                    },
                },
            },
        });
        mockSession(owner.id);
        const fileName = `organization/${organizationId}/logo.png`;
        await uploadFile({ bucket: 'main', file: loadTestNonSharedBuffer(), fileName });
        expect(await getStatObject({ bucket: 'main', fileName })).not.toBe(undefined);

        expect((await deleteOrg()).success).toBe(true);
        expect(await getStatObject({ bucket: 'main', fileName })).toBe(undefined);
    });
});
