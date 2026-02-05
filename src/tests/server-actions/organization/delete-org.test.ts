import { getStatObject, uploadFile } from '@/lib/minio';
import { prisma } from '@/lib/prisma';
import { deleteOrg as deleteOrgAction } from '@/lib/server-actions/organization';
import { loadTestNonSharedBuffer } from '@/tests/utils/example-img';
import { mockSession } from '@/tests/utils/mock-session';
import bcrypt from 'bcrypt';

const owner = { id: 'idOwner', memberId: 'idOwnerMember' };
const manager = { id: 'idManager', memberId: 'idManagerMember' };
const emp1 = { id: 'idEmp1', memberId: 'idEmp1Member' };
const orgId = 'orgId123';

beforeEach(async () => {
    const pwHash = await bcrypt.hash('admin1234', 9);
    await prisma.user.createMany({
        data: [
            { email: '1', name: '', password: pwHash, id: owner.id },
            { email: '2', name: '', password: pwHash, id: manager.id },
            { email: '3', name: '', password: pwHash, id: emp1.id },
        ],
    });

    await prisma.organization.create({
        data: {
            id: orgId,
            name: 'to delete',
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

describe('deleteOrg', () => {
    const performDelete = (pw = 'admin1234') => deleteOrgAction({ orgId, password: pw });

    test('employee and manager cannot delete organization', async () => {
        mockSession(emp1.id);
        expect((await performDelete()).success).toBe(false);

        mockSession(manager.id);
        expect((await performDelete()).success).toBe(false);

        expect(await prisma.organization.count()).toBe(1);
    });

    test('error when password is incorrect', async () => {
        mockSession(owner.id);
        const res = await performDelete('wrong-password');

        expect(res.success).toBe(false);
        expect(res.message).toBe('Error password incorrect');
        expect(await prisma.organization.findUnique({ where: { id: orgId } })).not.toBeNull();
    });

    test('owner can delete organization and its logo', async () => {
        mockSession(owner.id);

        const fileName = `organization/${orgId}/logo.png`;
        await uploadFile({ bucket: 'main', file: loadTestNonSharedBuffer(), fileName });

        const res = await performDelete();

        expect(res.success).toBe(true);
        expect(await prisma.organization.findUnique({ where: { id: orgId } })).toBeNull();

        const fileStat = await getStatObject({ bucket: 'main', fileName });
        expect(fileStat).toBe(undefined);
    });
});
