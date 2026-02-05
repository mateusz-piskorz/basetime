import { prisma } from '@/lib/prisma';
import { updateInvStatus as updateInvStatusAction } from '@/lib/server-actions/invitation';
import { mockSession } from '@/tests/utils/mock-session';
import { INVITATION_STATUS } from '@prisma/client';

const orgId = 'org-1';
const invId = 'inv-123';
const owner = 'user-owner';
const manager = 'user-manager';
const employee = 'user-employee';
const testUser = 'user-test';

const updateInv = (status: INVITATION_STATUS) => updateInvStatusAction({ invitationId: invId, status });
const assertInvStatus = async (status: INVITATION_STATUS) => {
    const inv = await prisma.invitation.findUnique({ where: { id: invId } });
    expect(inv?.status).toBe(status);
};

beforeEach(async () => {
    await prisma.user.createMany({
        data: [
            { id: owner, email: 'o@t.com', name: '', password: '' },
            { id: manager, email: 'm@t.com', name: '', password: '' },
            { id: employee, email: 'e@t.com', name: '', password: '' },
            { id: testUser, email: 't@t.com', name: '', password: '' },
        ],
    });

    await prisma.organization.create({
        data: {
            id: orgId,
            name: 'Org',
            currency: 'EUR',
            Members: {
                create: { role: 'OWNER', userId: owner },
            },
        },
    });

    await prisma.invitation.create({
        data: { id: invId, organizationId: orgId, userId: testUser, status: 'SENT' },
    });
});

describe('Permissions', () => {
    test('cancel - only owner should be able to cancel', async () => {
        for (const userId of [testUser, employee, manager]) {
            mockSession(userId);
            const res = await updateInv('CANCELED');
            expect(res.success).toBe(false);
        }
        await assertInvStatus('SENT');
    });

    test('reject/accept - only invited user should be able to respond', async () => {
        const forbiddenUsers = [owner, employee, manager];
        for (const userId of forbiddenUsers) {
            mockSession(userId);
            expect((await updateInv('REJECTED')).success).toBe(false);
            expect((await updateInv('ACCEPTED')).success).toBe(false);
        }
        await assertInvStatus('SENT');
    });
});

describe('Business Logic - Status transitions', () => {
    const otherStatuses: INVITATION_STATUS[] = ['ACCEPTED', 'CANCELED', 'REJECTED'];

    test('cannot cancel if status is not SENT', async () => {
        mockSession(owner);
        for (const status of otherStatuses) {
            await prisma.invitation.update({ where: { id: invId }, data: { status } });
            const res = await updateInv('CANCELED');
            expect(res.success).toBe(false);
            await assertInvStatus(status);
        }
    });

    test('cannot accept/reject if status is not SENT', async () => {
        mockSession(testUser);
        for (const status of otherStatuses) {
            await prisma.invitation.update({ where: { id: invId }, data: { status } });

            expect((await updateInv('ACCEPTED')).success).toBe(false);
            expect((await updateInv('REJECTED')).success).toBe(false);
            await assertInvStatus(status);
        }
    });
});

describe('Success cases', () => {
    test('owner can cancel invitation', async () => {
        mockSession(owner);
        const res = await updateInv('CANCELED');
        expect(res.success).toBe(true);
        await assertInvStatus('CANCELED');
    });

    test('invited person can accept invitation', async () => {
        mockSession(testUser);
        const res = await updateInv('ACCEPTED');
        expect(res.success).toBe(true);
        await assertInvStatus('ACCEPTED');
    });

    test('invited person can reject invitation', async () => {
        mockSession(testUser);
        const res = await updateInv('REJECTED');
        expect(res.success).toBe(true);
        await assertInvStatus('REJECTED');
    });
});
