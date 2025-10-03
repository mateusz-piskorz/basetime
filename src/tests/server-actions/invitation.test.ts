import { prisma } from '@/lib/prisma';
import { createInv as createInvAction, updateInvStatus } from '@/lib/server-actions/invitation';
import { INVITATION_STATUS } from '@prisma/client';
import { mockSession } from '../utils/mock-session';

const owner = 'idOwner';
const manager = 'idManager';
const employee = 'idEmployee';
const employeeEmail = 'employee@onet.pl';
const organizationId = 'organizationId123';
const testUser = 'johnId';
const testUserEmail = 'johnDoe@onet.pl';

beforeAll(async () => {
    await prisma.user.create({ data: { email: '1', name: '', password: '', id: owner } });
    await prisma.user.create({ data: { email: '2', name: '', password: '', id: manager } });
    await prisma.user.create({ data: { email: employeeEmail, name: '', password: '', id: employee } });
    await prisma.user.create({ data: { email: testUserEmail, name: '', password: '', id: testUser } });
    await prisma.organization.create({
        data: {
            id: organizationId,
            name: 'o',
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

describe('createInv', () => {
    const createInv = async (email: string) => await createInvAction({ email, organizationId });

    test('error permission', async () => {
        for (const userId of [testUser, employee, manager]) {
            mockSession(userId);
            expect((await createInv(testUserEmail)).success).toBe(false);
        }
        expect((await prisma.invitation.findMany()).length).toBe(0);
    });

    test(`error couldn't find user with email`, async () => {
        mockSession(owner);
        const res = await createInv('fake@email.com');
        expect(res.success).toBe(false);
        expect(res.message).toBe(`Error couldn't find user with email fake@email.com`);
        expect((await prisma.invitation.findMany()).length).toBe(0);
    });

    test('error is already a member', async () => {
        mockSession(owner);
        const res = await createInv(employeeEmail);
        expect(res.success).toBe(false);
        expect(res.message).toBe(`Error ${employeeEmail} is already a member of this organization`);
        expect((await prisma.invitation.findMany()).length).toBe(0);
    });

    test('owner can createInvitation', async () => {
        mockSession(owner);
        expect((await createInv(testUserEmail)).success).toBe(true);
        const invs = await prisma.invitation.findMany();
        expect(invs.length).toBe(1);
        expect(invs[0].status).toBe('SENT');
        expect(invs[0].organizationId).toBe(organizationId);
        expect(invs[0].userId).toBe(testUser);
    });

    test('error already sent', async () => {
        mockSession(owner);
        const res = await createInv(testUserEmail);
        expect(res.success).toBe(false);
        expect(res.message).toBe(`Error invitation was already sent to ${testUserEmail}`);
        expect((await prisma.invitation.findMany()).length).toBe(1);
    });
});

describe('updateInvStatus', () => {
    const invId = 'invId123';
    const assertInvStatus = async (status: string) => expect((await prisma.invitation.findUnique({ where: { id: invId } }))?.status).toBe(status);
    const updateInv = async (status: INVITATION_STATUS) => await updateInvStatus({ invitationId: invId, status });
    const updateInvPrisma = async (status: INVITATION_STATUS) => await prisma.invitation.update({ where: { id: invId }, data: { status } });

    beforeAll(async () => {
        await prisma.invitation.deleteMany();
        await prisma.invitation.create({ data: { organizationId, status: 'SENT', userId: testUser, id: invId } });
    });

    test('cancel - Error permission', async () => {
        for (const userId of [testUser, employee, manager]) {
            mockSession(userId);
            expect((await updateInv('CANCELED')).success).toBe(false);
        }
        await assertInvStatus('SENT');
    });

    test('reject - Error permission', async () => {
        for (const userId of [owner, employee, manager]) {
            mockSession(userId);
            expect((await updateInv('REJECTED')).success).toBe(false);
        }
        await assertInvStatus('SENT');
    });

    test('accept - Error permission', async () => {
        for (const userId of [owner, employee, manager]) {
            mockSession(userId);
            expect((await updateInv('ACCEPTED')).success).toBe(false);
        }
        await assertInvStatus('SENT');
    });

    test(`can't cancel inv in status other that SENT`, async () => {
        for (const status of ['ACCEPTED', 'CANCELED', 'REJECTED'] as const) {
            mockSession(owner);
            await updateInvPrisma(status);
            expect((await updateInv('CANCELED')).success).toBe(false);
            await assertInvStatus(status);
        }
    });

    test(`can't reject inv in status other that SENT`, async () => {
        for (const status of ['ACCEPTED', 'CANCELED', 'REJECTED'] as const) {
            mockSession(testUser);
            await updateInvPrisma(status);
            expect((await updateInv('REJECTED')).success).toBe(false);
            await assertInvStatus(status);
        }
    });

    test(`can't accept inv in status other that SENT`, async () => {
        for (const status of ['ACCEPTED', 'CANCELED', 'REJECTED'] as const) {
            mockSession(testUser);
            await updateInvPrisma(status);
            expect((await updateInv('ACCEPTED')).success).toBe(false);
            await assertInvStatus(status);
        }
    });

    test('owner can cancel invitation', async () => {
        await updateInvPrisma('SENT');
        mockSession(owner);
        expect((await updateInv('CANCELED')).success).toBe(true);
        await assertInvStatus('CANCELED');
    });

    test('the invited person can accept invitation', async () => {
        await updateInvPrisma('SENT');
        mockSession(testUser);
        expect((await updateInv('ACCEPTED')).success).toBe(true);
        await assertInvStatus('ACCEPTED');
    });

    test('the invited person can reject invitation', async () => {
        await updateInvPrisma('SENT');
        mockSession(testUser);
        expect((await updateInv('REJECTED')).success).toBe(true);
        await assertInvStatus('REJECTED');
    });
});
