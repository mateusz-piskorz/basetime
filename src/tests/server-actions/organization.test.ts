import { prisma } from '@/lib/prisma';
import { deleteOrg as deleteOrgAction, updateOrgLogo, upsertOrg } from '@/lib/server-actions/organization';
import { CURRENCY } from '@prisma/client';
import bcrypt from 'bcrypt';
import { getStatObject, minioClient, uploadFile } from '../../lib/minio';
import { getTestBase64String, loadTestNonSharedBuffer } from '../utils/example-img';
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

const orgId = 'orgId123';
const getOrgPrisma = async () => await prisma.organization.findUnique({ where: { id: orgId } });

beforeAll(async () => {
    const pwHash = await bcrypt.hash('admin1234', 9);
    await prisma.user.create({ data: { email: '1', name: '', password: pwHash, id: owner.id } });
    await prisma.user.create({ data: { email: '2', name: '', password: pwHash, id: manager.id } });
    await prisma.user.create({ data: { email: '3', name: '', password: pwHash, id: emp1.id } });
    await prisma.user.create({ data: { email: '4', name: '', password: pwHash, id: emp2.id } });
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
                        { role: 'EMPLOYEE', userId: emp2.id, id: emp2.memberId },
                    ],
                },
            },
        },
    });
});

describe('update org', () => {
    const updateOrg = async (name?: string, currency?: CURRENCY) => await upsertOrg({ organizationId: orgId, name, currency });

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
    const deleteOrg = async () => await deleteOrgAction({ orgId, password: 'admin1234' });

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
        const res = await deleteOrgAction({ orgId, password: 'incorrectPassword' });
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
                id: orgId,
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
        const fileName = `organization/${orgId}/logo.png`;
        await uploadFile({ bucket: 'main', file: loadTestNonSharedBuffer(), fileName });
        expect(await getStatObject({ bucket: 'main', fileName })).not.toBe(undefined);

        expect((await deleteOrg()).success).toBe(true);
        expect(await getStatObject({ bucket: 'main', fileName })).toBe(undefined);
    });
});

describe('updateOrgLogo', () => {
    const orgId1 = 'orgId1';
    const orgId2 = 'orgId2';
    const userOwner = 'userId1';
    const userEmployee = 'userId2';

    beforeAll(async () => {
        await prisma.user.deleteMany({});
        await prisma.organization.deleteMany({});
        await prisma.user.create({ data: { email: '1', name: '', password: '', id: userOwner } });
        await prisma.user.create({ data: { email: '2', name: '', password: '', id: userEmployee } });
        await prisma.organization.create({
            data: {
                id: orgId1,
                currency: 'EUR',
                name: '',
                Members: {
                    createMany: {
                        data: [
                            { role: 'OWNER', userId: userOwner },
                            { role: 'EMPLOYEE', userId: userEmployee },
                        ],
                    },
                },
            },
        });
        await prisma.organization.create({
            data: { id: orgId2, currency: 'EUR', name: '' },
        });

        await minioClient.removeObject('main', `organization/${orgId1}/logo.png`);
        await minioClient.removeObject('main', `organization/${orgId2}/logo.png`);

        await minioClient.putObject('main', `organization/${orgId2}/logo.png`, loadTestNonSharedBuffer(), undefined, {
            'org2-meta-test': 'orgWithLogo',
        });
    });

    test('employee cant update logo', async () => {
        mockSession(userEmployee);

        const res = await updateOrgLogo({ logoBase64: getTestBase64String(), orgId: orgId1 });

        expect(res.success).toBe(false);

        expect(await getStatObject({ bucket: 'main', fileName: `organization/${orgId1}/logo.png` })).toBe(undefined);

        // org2 logo not changed
        const obj = await getStatObject({ bucket: 'main', fileName: `organization/${orgId2}/logo.png` });
        expect(obj?.metaData['org2-meta-test']).toBe('orgWithLogo');
    });

    test('owner can update logo', async () => {
        mockSession(userOwner);

        const res = await updateOrgLogo({ logoBase64: getTestBase64String(), orgId: orgId1 });

        expect(res.success).toBe(true);

        expect(await getStatObject({ bucket: 'main', fileName: `organization/${orgId1}/logo.png` })).not.toBe(undefined);

        // org2 logo not changed
        const obj = await getStatObject({ bucket: 'main', fileName: `organization/${orgId2}/logo.png` });
        expect(obj?.metaData['org2-meta-test']).toBe('orgWithLogo');
    });

    test('employee cant remove logo', async () => {
        mockSession(userEmployee);

        const res = await updateOrgLogo({ logoBase64: null, orgId: orgId1 });

        expect(res.success).toBe(false);

        expect(await getStatObject({ bucket: 'main', fileName: `organization/${orgId1}/logo.png` })).not.toBe(undefined);

        // org2 logo not changed
        const obj = await getStatObject({ bucket: 'main', fileName: `organization/${orgId2}/logo.png` });
        expect(obj?.metaData['org2-meta-test']).toBe('orgWithLogo');
    });

    test('owner can remove logo', async () => {
        mockSession(userOwner);

        const res = await updateOrgLogo({ logoBase64: null, orgId: orgId1 });

        expect(res.success).toBe(true);

        expect(await getStatObject({ bucket: 'main', fileName: `organization/${orgId1}/logo.png` })).toBe(undefined);

        // org2 logo not changed
        const obj = await getStatObject({ bucket: 'main', fileName: `organization/${orgId2}/logo.png` });
        expect(obj?.metaData['org2-meta-test']).toBe('orgWithLogo');
    });
});
