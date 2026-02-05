import { getStatObject, minioClient } from '@/lib/minio';
import { prisma } from '@/lib/prisma';
import { updateOrgLogo } from '@/lib/server-actions/organization';
import { getTestBase64String, loadTestNonSharedBuffer } from '@/tests/utils/example-img';
import { mockSession } from '@/tests/utils/mock-session';

const orgId1 = 'orgId1';
const orgId2 = 'orgId2';
const userOwner = 'userId1';
const userEmployee = 'userId2';
const logoPath1 = `organization/${orgId1}/logo.png`;
const logoPath2 = `organization/${orgId2}/logo.png`;

beforeEach(async () => {
    await prisma.user.createMany({
        data: [
            { email: '1', name: '', password: '', id: userOwner },
            { email: '2', name: '', password: '', id: userEmployee },
        ],
    });

    await prisma.organization.create({ data: { id: orgId2, currency: 'EUR', name: orgId2 } });
    await prisma.organization.create({
        data: {
            id: orgId1,
            currency: 'EUR',
            name: orgId1,
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

    await minioClient.putObject('main', logoPath2, loadTestNonSharedBuffer(), undefined, {
        'org2-meta-test': 'orgWithLogo',
    });
});

describe('updateOrgLogo', () => {
    const checkOrg2LogoIntact = async () => {
        const obj = await getStatObject({ bucket: 'main', fileName: logoPath2 });
        expect(obj?.metaData['org2-meta-test']).toBe('orgWithLogo');
    };

    test('employee cannot update logo', async () => {
        mockSession(userEmployee);

        const res = await updateOrgLogo({ logoBase64: getTestBase64String(), orgId: orgId1 });

        expect(res.success).toBe(false);
        expect(await getStatObject({ bucket: 'main', fileName: logoPath1 })).toBe(undefined);
        await checkOrg2LogoIntact();
    });

    test('owner can update logo', async () => {
        mockSession(userOwner);

        const res = await updateOrgLogo({ logoBase64: getTestBase64String(), orgId: orgId1 });

        expect(res.success).toBe(true);
        expect(await getStatObject({ bucket: 'main', fileName: logoPath1 })).not.toBe(undefined);
        await checkOrg2LogoIntact();
    });

    test('employee cannot remove logo', async () => {
        mockSession(userOwner);
        await updateOrgLogo({ logoBase64: getTestBase64String(), orgId: orgId1 });

        mockSession(userEmployee);
        const res = await updateOrgLogo({ logoBase64: null, orgId: orgId1 });

        expect(res.success).toBe(false);
        expect(await getStatObject({ bucket: 'main', fileName: logoPath1 })).not.toBe(undefined);
        await checkOrg2LogoIntact();
    });

    test('owner can remove logo', async () => {
        mockSession(userOwner);
        await updateOrgLogo({ logoBase64: getTestBase64String(), orgId: orgId1 });

        mockSession(userOwner);
        const res = await updateOrgLogo({ logoBase64: null, orgId: orgId1 });

        expect(res.success).toBe(true);
        expect(await getStatObject({ bucket: 'main', fileName: logoPath1 })).toBe(undefined);
        await checkOrg2LogoIntact();
    });
});
