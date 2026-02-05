/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/prisma';
import { removeTimeEntries } from '@/lib/server-actions/time-entry';
import { mockSession } from '@/tests/utils/mock-session';
import { isArray } from 'lodash';

const employee = 'member1';
const manager = 'member2';
const owner = 'member3';
const orgId = 'orgId';
const projectId = 'projectId';

const makeTimeEntries = async <T extends string | string[]>(memberId: T): Promise<T extends string ? string : string[]> => {
    if (!isArray(memberId)) {
        const entry = await prisma.timeEntry.create({ data: { name: '', start: new Date(), memberId, organizationId: orgId } });
        return entry.id as any;
    }

    await prisma.timeEntry.createMany({
        data: memberId.map((m) => ({ name: '', start: new Date(), memberId: m, organizationId: orgId })),
    });

    const entries = await prisma.timeEntry.findMany();
    return entries.map((e) => e.id) as any;
};

beforeEach(async () => {
    await prisma.organization.create({
        data: { id: orgId, name: 'o', currency: 'EUR', Projects: { create: { color: 'BLUE', name: '', id: projectId, shortName: '2' } } },
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

test('employee can remove his time entry', async () => {
    mockSession(employee);
    const entryId = await makeTimeEntries(employee);
    const res = await removeTimeEntries({ timeEntryIds: [entryId] });

    expect(res.success).toBe(true);
    expect(await prisma.timeEntry.count()).toBe(0);
});

test(`employee can't remove someone's time entry`, async () => {
    mockSession(employee);
    const entryId = await makeTimeEntries(manager);
    const res = await removeTimeEntries({ timeEntryIds: [entryId] });

    expect(res.success).toBe(false);
    expect(await prisma.timeEntry.count()).toBe(1);
});

test(`manager can remove his and someone's time entry`, async () => {
    mockSession(manager);
    const ids = await makeTimeEntries([manager, employee]);
    const res = await removeTimeEntries({ timeEntryIds: ids });

    expect(res.success).toBe(true);
    expect(await prisma.timeEntry.count()).toBe(0);
});

test(`owner can remove his and someone's time entry`, async () => {
    mockSession(owner);
    const ids = await makeTimeEntries([owner, manager]);
    const res = await removeTimeEntries({ timeEntryIds: ids });

    expect(res.success).toBe(true);
    expect(await prisma.timeEntry.count()).toBe(0);
});
