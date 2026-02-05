import { prisma } from '@/lib/prisma';
import { toggleTimer } from '@/lib/server-actions/time-entry';
import { mockSession } from '@/tests/utils/mock-session';

const member1 = 'member1';
const member2 = 'member2';
const orgId = 'orgId';
const projectId = 'projectId';

beforeEach(async () => {
    await prisma.organization.create({
        data: {
            id: orgId,
            name: 'o',
            currency: 'EUR',
            Projects: { create: { color: 'BLUE', name: '', id: projectId, shortName: '1' } },
        },
    });

    for (const memberId of [member1, member2]) {
        await prisma.user.create({
            data: {
                id: memberId,
                email: `${memberId}@test.pl`,
                name: '',
                password: '',
                Members: { create: { role: 'EMPLOYEE', organizationId: orgId, id: memberId } },
            },
        });
    }
});

test('member1 can start a timer', async () => {
    mockSession(member1);
    const res = await toggleTimer({ name: 'work1', orgId, projectId });

    expect(res.success).toBe(true);
    expect(res.message).toBe('Timer started successfully');

    const timeEntries = await prisma.timeEntry.findMany();
    expect(timeEntries.length).toBe(1);
    expect(timeEntries[0].memberId).toBe(member1);
    expect(timeEntries[0].name).toBe('work1');
    expect(timeEntries[0].end).toBe(null);
});

test('member2 can start a timer, without affecting member1', async () => {
    await prisma.timeEntry.create({
        data: { memberId: member1, organizationId: orgId, projectId, name: 'work1', start: new Date() },
    });

    mockSession(member2);
    const res = await toggleTimer({ name: 'work2', orgId, projectId });

    expect(res.success).toBe(true);

    const timeEntries = await prisma.timeEntry.findMany();
    expect(timeEntries.length).toBe(2);
    expect(timeEntries.find((t) => t.memberId === member1)?.name).toBe('work1');
    expect(timeEntries.find((t) => t.memberId === member2)?.name).toBe('work2');
});

test('member1 can stop his timer', async () => {
    await prisma.timeEntry.createMany({
        data: [
            { memberId: member1, organizationId: orgId, projectId, name: 'work1', start: new Date() },
            { memberId: member2, organizationId: orgId, projectId, name: 'work2', start: new Date() },
        ],
    });

    mockSession(member1);
    const res = await toggleTimer({ orgId });

    expect(res.success).toBe(true);
    expect(res.message).toBe('Timer stopped successfully');

    const t1 = await prisma.timeEntry.findFirst({ where: { memberId: member1 } });
    const t2 = await prisma.timeEntry.findFirst({ where: { memberId: member2 } });

    expect(t1?.end).not.toBe(null);
    expect(t2?.end).toBe(null);
});

test('member2 can stop his timer', async () => {
    await prisma.timeEntry.createMany({
        data: [
            { memberId: member1, organizationId: orgId, projectId, name: 'work1', start: new Date(), end: new Date() },
            { memberId: member2, organizationId: orgId, projectId, name: 'work2', start: new Date() },
        ],
    });

    mockSession(member2);
    const res = await toggleTimer({ orgId });

    expect(res.success).toBe(true);

    const t2 = await prisma.timeEntry.findFirst({ where: { memberId: member2 } });
    expect(t2?.end).not.toBe(null);
});
