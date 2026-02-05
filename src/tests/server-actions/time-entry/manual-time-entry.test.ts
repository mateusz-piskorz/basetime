import { prisma } from '@/lib/prisma';
import { manualTimeEntry } from '@/lib/server-actions/time-entry';
import { mockSession } from '@/tests/utils/mock-session';

const employee = 'member1';
const manager = 'member2';
const owner = 'member3';
const orgId = 'orgId';
const projectId = 'projectId';

beforeEach(async () => {
    await prisma.organization.create({
        data: { id: orgId, name: 'o', currency: 'EUR', Projects: { create: { color: 'BLUE', name: '', id: projectId, shortName: '3' } } },
    });

    const roles = { [employee]: 'EMPLOYEE', [manager]: 'MANAGER', [owner]: 'OWNER' } as const;

    for (const [id, role] of Object.entries(roles)) {
        await prisma.user.create({
            data: {
                id,
                email: `${id}@test.pl`,
                name: '',
                password: '',
                Members: { create: { role, organizationId: orgId, id } },
            },
        });
    }
});

test('employee can add time entry and edit it', async () => {
    mockSession(employee);
    const res = await manualTimeEntry({ end: new Date(), start: new Date(), orgId, name: 'SU-100', projectId });
    expect(res.success).toBe(true);

    const timeEntry = await prisma.timeEntry.findFirst();
    expect(timeEntry?.name).toBe('SU-100');

    mockSession(employee);
    const updateRes = await manualTimeEntry({ timeEntryId: timeEntry?.id, name: 'SU-200', orgId });
    expect(updateRes.success).toBe(true);
    expect((await prisma.timeEntry.findFirst())?.name).toBe('SU-200');
});

test(`employee can't edit someone's time entry`, async () => {
    const { id } = await prisma.timeEntry.create({
        data: { name: 'original', start: new Date(), organizationId: orgId, memberId: manager },
    });

    mockSession(employee);
    const res = await manualTimeEntry({ name: 'updated-name', timeEntryId: id });

    expect(res.success).toBe(false);
    const entry = await prisma.timeEntry.findUnique({ where: { id } });
    expect(entry?.name).toBe('original');
});

test(`manager can edit someone's time entry`, async () => {
    const { id } = await prisma.timeEntry.create({
        data: { name: 'original', start: new Date(), organizationId: orgId, memberId: employee },
    });

    mockSession(manager);
    const res = await manualTimeEntry({ name: 'updated-name', timeEntryId: id });

    expect(res.success).toBe(true);
    const entry = await prisma.timeEntry.findUnique({ where: { id } });
    expect(entry?.name).toBe('updated-name');
});

test(`owner can edit someone's time entry`, async () => {
    const { id } = await prisma.timeEntry.create({
        data: { name: 'original', start: new Date(), organizationId: orgId, memberId: employee },
    });

    mockSession(owner);
    const res = await manualTimeEntry({ name: 'updated-name', timeEntryId: id });

    expect(res.success).toBe(true);
    expect((await prisma.timeEntry.findFirst())?.name).toBe('updated-name');
});
