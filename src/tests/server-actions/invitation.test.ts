import { prisma } from '@/lib/prisma';
import { acceptInvitation, cancelInvitation, createInvitation, rejectInvitation } from '@/lib/server-actions/invitation';
import { getSession } from '@/lib/session';

const ownerUserId = 'idOwner';
const managerUserId = 'idManager';
const employeeUserId = 'idEmployee';
const employeeMemberEmail = 'employee@onet.pl';

const organizationId = 'organizationId123';

const exampleUserId = 'idExample';
const exampleUserEmail = 'johnDoe@onet.pl';

jest.mock('@/lib/session', () => {
    const mockGetSession = jest.fn();
    mockGetSession.mockReturnValue({ userId: ownerUserId });
    return {
        getSession: mockGetSession,
    };
});

test('invitation setup', async () => {
    await prisma.user.create({ data: { email: '1', name: '', password: '', id: ownerUserId } });
    await prisma.user.create({ data: { email: '2', name: '', password: '', id: managerUserId } });
    await prisma.user.create({ data: { email: employeeMemberEmail, name: '', password: '', id: employeeUserId } });
    await prisma.user.create({ data: { email: exampleUserEmail, name: '', password: '', id: exampleUserId } });
    await prisma.organization.create({
        data: {
            id: organizationId,
            name: 'o',
            currency: 'EUR',
            Members: {
                createMany: {
                    data: [
                        { role: 'OWNER', userId: ownerUserId },
                        { role: 'MANAGER', userId: managerUserId },
                        { role: 'EMPLOYEE', userId: employeeUserId },
                    ],
                },
            },
        },
    });
});

// createInvitation
test('createInvitation - Error permission', async () => {
    const mockedGetSession = getSession as jest.Mock;
    mockedGetSession.mockReturnValueOnce({ userId: managerUserId });
    const res = await createInvitation({ email: exampleUserEmail, organizationId });
    expect(res.success).toBe(false);
    expect(res.message).toBe('Error permission');

    mockedGetSession.mockReturnValueOnce({ userId: employeeUserId });
    const res2 = await createInvitation({ email: exampleUserEmail, organizationId });
    expect(res2.success).toBe(false);
    expect(res2.message).toBe('Error permission');

    mockedGetSession.mockReturnValueOnce({ userId: exampleUserId });
    const res3 = await createInvitation({ email: exampleUserEmail, organizationId });
    expect(res3.success).toBe(false);
    expect(res3.message).toBe('Error permission');
});

test('createInvitation - is already a member error', async () => {
    const res = await createInvitation({ email: employeeMemberEmail, organizationId });
    expect(res.success).toBe(false);
    expect(res.message).toBe(`Error ${employeeMemberEmail} is already a member of this organization`);
});

test('owner can createInvitation', async () => {
    const res = await createInvitation({ email: exampleUserEmail, organizationId });
    expect(res.success).toBe(true);
    expect(res.data?.status).toBe('SENT');
});

test('createInvitation - already sent error', async () => {
    const res = await createInvitation({ email: exampleUserEmail, organizationId });
    expect(res.success).toBe(false);
    expect(res.message).toBe(`Error Invitation was already sent to ${exampleUserEmail}`);
});

// cancelInvitation
test('cancelInvitation - Error permission', async () => {
    const mockedGetSession = getSession as jest.Mock;
    mockedGetSession.mockReturnValueOnce({ userId: managerUserId });
    const invitation = await prisma.invitation.findFirst();
    expect(invitation).not.toBe(null);

    const res = await cancelInvitation({ invitationId: invitation!.id });
    expect(res.success).toBe(false);

    mockedGetSession.mockReturnValueOnce({ userId: employeeUserId });
    const res2 = await cancelInvitation({ invitationId: invitation!.id });
    expect(res2.success).toBe(false);

    mockedGetSession.mockReturnValueOnce({ userId: exampleUserId });
    const res3 = await cancelInvitation({ invitationId: invitation!.id });
    expect(res3.success).toBe(false);
});

test('owner can cancelInvitation', async () => {
    const invitation = await prisma.invitation.findFirst();
    expect(invitation).not.toBe(null);
    const res = await cancelInvitation({ invitationId: invitation!.id });
    expect(res.success).toBe(true);
    expect(res.data?.status).toBe('CANCELED');
});

// acceptInvitation
test('acceptInvitation - error permission', async () => {
    await createInvitation({ email: exampleUserEmail, organizationId });
    const invitation = await prisma.invitation.findFirst({ where: { status: 'SENT' } });
    expect(invitation).not.toBe(null);
    const res = await acceptInvitation({ invitationId: invitation!.id, organizationId });
    expect(res.success).toBe(false);
});

test('the invited person can acceptInvitation', async () => {
    const mockedGetSession = getSession as jest.Mock;
    mockedGetSession.mockReturnValueOnce({ userId: exampleUserId });
    const invitation = await prisma.invitation.findFirst({ where: { status: 'SENT' } });
    expect(invitation).not.toBe(null);
    const res = await acceptInvitation({ invitationId: invitation!.id, organizationId });
    expect(res.success).toBe(true);
    expect(res.data?.status).toBe('ACCEPTED');
});

// rejectInvitation
test('rejectInvitation - error permission', async () => {
    const member = await prisma.member.findFirst({ where: { userId: exampleUserId } });
    if (member) {
        await prisma.member.delete({ where: { id: member.id } });
    }
    await createInvitation({ email: exampleUserEmail, organizationId });
    const invitation = await prisma.invitation.findFirst({ where: { status: 'SENT' } });
    expect(invitation).not.toBe(null);
    const res = await rejectInvitation({ invitationId: invitation!.id });
    expect(res.success).toBe(false);
});

test('the invited person can rejectInvitation', async () => {
    const mockedGetSession = getSession as jest.Mock;
    mockedGetSession.mockReturnValueOnce({ userId: exampleUserId });
    const invitation = await prisma.invitation.findFirst({ where: { status: 'SENT' } });
    expect(invitation).not.toBe(null);
    const res = await rejectInvitation({ invitationId: invitation!.id });
    expect(res.success).toBe(true);
    expect(res.data?.status).toBe('REJECTED');
});
