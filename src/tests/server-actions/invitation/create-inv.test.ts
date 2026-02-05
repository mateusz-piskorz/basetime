import { prisma } from '@/lib/prisma'; // dostosuj ścieżkę do swojego klienta
import { createInv as createInvAction } from '@/lib/server-actions/invitation'; // dostosuj ścieżkę
import { mockSession } from '@/tests/utils/mock-session';

const orgId = 'org-1';
const owner = 'user-owner';
const manager = 'user-manager';
const employee = 'user-employee';
const testUser = 'user-test';

const employeeEmail = 'employee@test.com';
const testUserEmail = 'test@test.com';

const createInv = async (email: string) => await createInvAction({ email, orgId });

beforeEach(async () => {
    await prisma.user.createMany({
        data: [
            { id: owner, email: 'owner@test.com', name: '', password: '' },
            { id: manager, email: 'manager@test.com', name: '', password: '' },
            { id: employee, email: employeeEmail, name: '', password: '' },
            { id: testUser, email: testUserEmail, name: '', password: '' },
        ],
    });

    await prisma.organization.create({
        data: {
            id: orgId,
            name: 'Test Org',
            currency: 'EUR',
            Members: {
                createMany: {
                    data: [
                        { role: 'OWNER', userId: owner },
                        { role: 'MANAGER', userId: manager },
                        { role: 'EMPLOYEE', userId: employee },
                    ],
                },
            },
        },
    });
});

test('should fail if user has insufficient permissions (MANAGER, EMPLOYEE, STRANGER)', async () => {
    for (const userId of [testUser, employee, manager]) {
        mockSession(userId);
        const res = await createInv(testUserEmail);
        expect(res.success).toBe(false);
    }
    const invs = await prisma.invitation.findMany();
    expect(invs.length).toBe(0);
});

test('should fail when invited user email does not exist', async () => {
    mockSession(owner);
    const fakeEmail = 'fake@email.com';
    const res = await createInv(fakeEmail);

    expect(res.success).toBe(false);
    expect(res.message).toBe(`Error couldn't find user with email ${fakeEmail}`);
    expect(await prisma.invitation.count()).toBe(0);
});

test('should fail if user is already a member of the organization', async () => {
    mockSession(owner);
    const res = await createInv(employeeEmail);

    expect(res.success).toBe(false);
    expect(res.message).toBe(`Error ${employeeEmail} is already a member of this organization`);
    expect(await prisma.invitation.count()).toBe(0);
});

test('should allow owner to create an invitation successfully', async () => {
    mockSession(owner);
    const res = await createInv(testUserEmail);

    expect(res.success).toBe(true);

    const invs = await prisma.invitation.findMany();
    expect(invs).toHaveLength(1);
    expect(invs[0]).toMatchObject({
        status: 'SENT',
        organizationId: orgId,
        userId: testUser,
    });
});

test('should fail if invitation was already sent to the user', async () => {
    mockSession(owner);

    await createInv(testUserEmail);

    mockSession(owner);
    const res = await createInv(testUserEmail);

    expect(res.success).toBe(false);
    expect(res.message).toBe(`Error invitation was already sent to ${testUserEmail}`);
    expect(await prisma.invitation.count()).toBe(1);
});
