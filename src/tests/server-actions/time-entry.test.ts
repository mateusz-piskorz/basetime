import { prisma } from '@/lib/prisma';
import { manualTimeEntry, removeTimeEntries, startTimeTracker, stopTimeTracker } from '@/lib/server-actions/time-entry';
import { getSession } from '@/lib/session';
import bcrypt from 'bcrypt';

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

const organizationId = 'organizationId123';

jest.mock('@/lib/session', () => {
    const mockGetSession = jest.fn();
    mockGetSession.mockReturnValue({ userId: owner.id });
    return {
        getSession: mockGetSession,
    };
});

test('project setup', async () => {
    const pwHash = await bcrypt.hash('admin12345', 9);
    await prisma.user.create({ data: { email: '1', name: '', password: pwHash, id: owner.id } });
    await prisma.user.create({ data: { email: '2', name: '', password: pwHash, id: manager.id } });
    await prisma.user.create({ data: { email: '3', name: '', password: pwHash, id: emp1.id } });
    await prisma.user.create({ data: { email: '4', name: '', password: pwHash, id: emp2.id } });
    await prisma.organization.create({
        data: {
            id: organizationId,
            name: 'o',
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

const mockedGetSession = getSession as jest.Mock;

// start/stop TimeTracker

test('employee can start and stop timer', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: emp1.id });
    const res = await startTimeTracker({ memberId: emp1.memberId, organizationId });
    expect(res.success).toBe(true);
    const stopRes = await stopTimeTracker({ timeEntryId: res.data!.id });
    expect(stopRes.success).toBe(true);
});

test('manager can start and stop timer', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: manager.id });
    const res = await startTimeTracker({ memberId: manager.memberId, organizationId });
    expect(res.success).toBe(true);
    const stopRes = await stopTimeTracker({ timeEntryId: res.data!.id });
    expect(stopRes.success).toBe(true);
});

test('owner can start and stop timer', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: owner.id });
    const res = await startTimeTracker({ memberId: owner.memberId, organizationId });
    expect(res.success).toBe(true);
    const stopRes = await stopTimeTracker({ timeEntryId: res.data!.id });
    expect(stopRes.success).toBe(true);
});

// manual/remove time entry

test('employee can create manual time entry and remove it', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: emp1.id });
    const res = await manualTimeEntry({ organizationId, start: new Date(), end: new Date() });
    expect(res.success).toBe(true);
    const removeRes = await removeTimeEntries({ timeEntryIds: [res.data!.id] });
    expect(removeRes.success).toBe(true);
});

test('employee cannot edit other time entries', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: emp2.id });
    const res = await manualTimeEntry({ organizationId, start: new Date(), end: new Date() });
    expect(res.success).toBe(true);

    mockedGetSession.mockReturnValueOnce({ userId: emp1.id });
    const res2 = await manualTimeEntry({ timeEntryId: res.data!.id, organizationId, start: new Date(), end: new Date() });
    expect(res2.success).toBe(false);
    mockedGetSession.mockReturnValueOnce({ userId: emp1.id });
    const removeRes = await removeTimeEntries({ timeEntryIds: [res.data!.id] });
    expect(removeRes.success).toBe(false);
});

test('manager can create manual time entry and remove it', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: manager.id });
    const res = await manualTimeEntry({ organizationId, start: new Date(), end: new Date() });
    expect(res.success).toBe(true);
    const removeRes = await removeTimeEntries({ timeEntryIds: [res.data!.id] });
    expect(removeRes.success).toBe(true);
});

test('manager can edit other time entries', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: emp2.id });
    const res = await manualTimeEntry({ organizationId, start: new Date(), end: new Date() });
    expect(res.success).toBe(true);

    mockedGetSession.mockReturnValueOnce({ userId: manager.id });
    const res2 = await manualTimeEntry({ timeEntryId: res.data!.id, organizationId, start: new Date(), end: new Date() });
    expect(res2.success).toBe(true);
    mockedGetSession.mockReturnValueOnce({ userId: manager.id });
    const removeRes = await removeTimeEntries({ timeEntryIds: [res.data!.id] });
    expect(removeRes.success).toBe(true);
});

test('owner can create manual time entry and remove it', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: owner.id });
    const res = await manualTimeEntry({ organizationId, start: new Date(), end: new Date() });
    expect(res.success).toBe(true);
    const removeRes = await removeTimeEntries({ timeEntryIds: [res.data!.id] });
    expect(removeRes.success).toBe(true);
});

test('owner can edit other time entries', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: emp2.id });
    const res = await manualTimeEntry({ organizationId, start: new Date(), end: new Date() });
    expect(res.success).toBe(true);

    mockedGetSession.mockReturnValueOnce({ userId: owner.id });
    const res2 = await manualTimeEntry({ timeEntryId: res.data!.id, organizationId, start: new Date(), end: new Date() });
    expect(res2.success).toBe(true);
    mockedGetSession.mockReturnValueOnce({ userId: owner.id });
    const removeRes = await removeTimeEntries({ timeEntryIds: [res.data!.id] });
    expect(removeRes.success).toBe(true);
});
