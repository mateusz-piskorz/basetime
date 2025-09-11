import { prisma } from '@/lib/prisma';
import { getQueryClient, trpc } from '@/lib/trpc/server-client';
import dayjs from 'dayjs';

jest.mock('@/lib/session', () => ({
    getSession: () => ({
        sessionId: 'dwada',
        id: 'ownerUserId',
        email: 'owneremail@spoko.pl',
        name: 'ownerUser',
    }),
}));

jest.mock('server-only', () => ({}));

test('get organization test', async () => {
    await prisma.user.create({ data: { email: 'owneremail@spoko.pl', password: 'admin1234', name: 'ownerUser', id: 'ownerUserId' } });
    await prisma.user.create({ data: { email: 'employeeemail@spoko.pl', password: 'admin1234', name: 'employeeUser', id: 'employeeUserId' } });
    await prisma.organization.create({ data: { currency: 'PLN', name: 'organizationName', id: 'organizationID' } });
    await prisma.member.create({ data: { role: 'OWNER', userId: 'ownerUserId', organizationId: 'organizationID', id: 'ownerMemberId' } });
    await prisma.member.create({ data: { role: 'EMPLOYEE', userId: 'employeeUserId', organizationId: 'organizationID', id: 'employeeMemberId' } });
    await prisma.timeEntry.create({
        data: {
            name: 'owners time entry',
            start: dayjs().subtract(2, 'h').toDate(),
            end: dayjs().toDate(),
            organizationId: 'organizationID',
            memberId: 'ownerMemberId',
        },
    });
    await prisma.timeEntry.create({
        data: {
            name: 'employee time entry',
            start: dayjs().subtract(2, 'h').toDate(),
            end: dayjs().toDate(),
            organizationId: 'organizationID',
            memberId: 'employeeMemberId',
        },
    });

    const queryClient = getQueryClient();
    const res = await queryClient.fetchQuery(
        trpc.getOrganization.queryOptions({
            organizationId: 'organizationID',
        }),
    );
    expect(res?.name).toBe('organizationName');
});
