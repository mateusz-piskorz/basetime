import { prisma } from '@/lib/prisma';
import { manualTimeEntry, removeTimeEntries, toggleTimer } from '@/lib/server-actions/time-entry';
import { isArray } from 'lodash';
import { mockSession } from '../utils/mock-session';

describe('toggleTimer', () => {
    const member1 = 'member1';
    const member2 = 'member2';
    const orgId = 'orgId';
    const projectId = 'projectId';

    beforeAll(async () => {
        await prisma.organization.create({
            data: { id: orgId, name: 'o', currency: 'EUR', Projects: { create: { color: 'BLUE', name: '', id: projectId, shortName: '1' } } },
        });

        for (const memberId of [member1, member2]) {
            await prisma.user.create({
                data: {
                    id: memberId,
                    email: memberId,
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
        expect(timeEntries[0].organizationId).toBe(orgId);
        expect(timeEntries[0].name).toBe('work1');
        expect(timeEntries[0].projectId).toBe(projectId);
        expect(timeEntries[0].end).toBe(null);
    });

    test('member2 can start a timer, without affecting member1', async () => {
        mockSession(member2);
        const res = await toggleTimer({ name: 'work2', orgId, projectId });
        expect(res.success).toBe(true);
        expect(res.message).toBe('Timer started successfully');

        const timeEntries = await prisma.timeEntry.findMany();
        expect(timeEntries.length).toBe(2);
        expect(timeEntries.find((t) => t.memberId === member1)?.name).toBe('work1');
        expect(timeEntries.find((t) => t.memberId === member2)?.name).toBe('work2');
    });

    test('member1 can stop his timer', async () => {
        mockSession(member1);
        const res = await toggleTimer({ orgId });
        expect(res.success).toBe(true);
        expect(res.message).toBe('Timer stopped successfully');

        const timeEntries = await prisma.timeEntry.findMany();
        expect(timeEntries.length).toBe(2);
        expect(timeEntries.find((t) => t.memberId === member1)?.end).not.toBe(null);
        expect(timeEntries.find((t) => t.memberId === member2)?.end).toBe(null);
    });

    test('member2 can stop his timer', async () => {
        mockSession(member2);
        const res = await toggleTimer({ orgId });
        expect(res.success).toBe(true);
        expect(res.message).toBe('Timer stopped successfully');

        const timeEntries = await prisma.timeEntry.findMany();
        expect(timeEntries.length).toBe(2);
        timeEntries.forEach((t) => {
            expect(t.end).not.toBe(null);
        });
    });
});

describe('removeTimeEntries', () => {
    const employee = 'member1';
    const manager = 'member2';
    const owner = 'member3';
    const orgId = 'orgId';
    const projectId = 'projectId';

    const makeTimeEntries = async <T extends string | string[]>(memberId: T): Promise<T extends string ? string : string[]> => {
        if (!isArray(memberId)) {
            const entry = await prisma.timeEntry.create({ data: { name: '', start: new Date(), memberId, organizationId: orgId } });
            // @ts-expect-error cos
            return entry.id;
        }

        await prisma.timeEntry.createMany({
            data: memberId.map((m) => ({ name: '', start: new Date(), memberId: m, organizationId: orgId })),
        });

        // @ts-expect-error cos
        return (await prisma.timeEntry.findMany()).map((e) => e.id);
    };

    beforeAll(async () => {
        await prisma.organization.deleteMany();
        await prisma.user.deleteMany();

        await prisma.organization.create({
            data: { id: orgId, name: 'o', currency: 'EUR', Projects: { create: { color: 'BLUE', name: '', id: projectId, shortName: '2' } } },
        });

        for (const memberId of [employee, manager, owner]) {
            const role = {
                member1: 'EMPLOYEE',
                member2: 'MANAGER',
                member3: 'OWNER',
            } as const;

            await prisma.user.create({
                data: {
                    id: memberId,
                    email: memberId,
                    name: '',
                    password: '',
                    Members: { create: { role: role[memberId as keyof typeof role], organizationId: orgId, id: memberId } },
                },
            });
        }
    });

    beforeEach(async () => {
        await prisma.timeEntry.deleteMany({});
    });

    test('employee can remove his time entry', async () => {
        mockSession(employee);
        expect((await removeTimeEntries({ timeEntryIds: [await makeTimeEntries(employee)] })).success).toBe(true);
        expect((await prisma.timeEntry.findMany()).length).toBe(0);
    });

    test(`employee can't remove someone's time entry`, async () => {
        mockSession(employee);
        expect((await removeTimeEntries({ timeEntryIds: [await makeTimeEntries(manager)] })).success).toBe(false);
        expect((await prisma.timeEntry.findMany()).length).toBe(1);
    });

    test(`manager can remove his and someone's time entry`, async () => {
        mockSession(manager);
        expect((await removeTimeEntries({ timeEntryIds: await makeTimeEntries([manager, employee]) })).success).toBe(true);
        expect((await prisma.timeEntry.findMany()).length).toBe(0);
    });

    test(`owner can remove his and someone's time entry`, async () => {
        mockSession(owner);
        expect((await removeTimeEntries({ timeEntryIds: await makeTimeEntries([owner, manager]) })).success).toBe(true);
        expect((await prisma.timeEntry.findMany()).length).toBe(0);
    });
});

describe('manualTimeEntry', () => {
    const employee = 'member1';
    const manager = 'member2';
    const owner = 'member3';
    const orgId = 'orgId';
    const projectId = 'projectId';

    beforeAll(async () => {
        await prisma.organization.deleteMany();
        await prisma.user.deleteMany();

        await prisma.organization.create({
            data: { id: orgId, name: 'o', currency: 'EUR', Projects: { create: { color: 'BLUE', name: '', id: projectId, shortName: '3' } } },
        });

        for (const memberId of [employee, manager, owner]) {
            const role = {
                member1: 'EMPLOYEE',
                member2: 'MANAGER',
                member3: 'OWNER',
            } as const;

            await prisma.user.create({
                data: {
                    id: memberId,
                    email: memberId,
                    name: '',
                    password: '',
                    Members: { create: { role: role[memberId as keyof typeof role], organizationId: orgId, id: memberId } },
                },
            });
        }
    });

    beforeEach(async () => {
        await prisma.timeEntry.deleteMany({});
    });

    test('employee can add time entry and edit it', async () => {
        mockSession(employee);
        const res = await manualTimeEntry({ end: new Date(), start: new Date(), orgId, name: 'SU-100', projectId });
        expect(res.success).toBe(true);

        expect((await prisma.timeEntry.findMany()).length).toBe(1);
        const timeEntry = await prisma.timeEntry.findFirst();
        expect(timeEntry?.projectId).toBe(projectId);
        expect(timeEntry?.organizationId).toBe(orgId);
        expect(timeEntry?.name).toBe('SU-100');
        expect(timeEntry?.end).not.toBe(null);

        mockSession(employee);
        const updateRes = await manualTimeEntry({ timeEntryId: timeEntry?.id, name: 'SU-200', orgId });
        expect(updateRes.success).toBe(true);
        expect((await prisma.timeEntry.findMany()).length).toBe(1);
        expect((await prisma.timeEntry.findFirst())?.name).toBe('SU-200');
    });

    test(`employee can't edit someone's time entry`, async () => {
        mockSession(employee);
        const { id } = await prisma.timeEntry.create({ data: { name: '', start: new Date(), organizationId: orgId, memberId: manager } });
        const res = await manualTimeEntry({ name: 'updated-name', timeEntryId: id });
        expect(res.success).toBe(false);
        expect((await prisma.timeEntry.findMany()).length).toBe(1);
        expect((await prisma.timeEntry.findFirst())?.name).not.toBe('updated-name');
    });

    test(`manager can edit someone's time entry`, async () => {
        mockSession(manager);
        const { id } = await prisma.timeEntry.create({ data: { name: '', start: new Date(), organizationId: orgId, memberId: employee } });
        const res = await manualTimeEntry({ name: 'updated-name', timeEntryId: id });
        expect(res.success).toBe(true);
        expect((await prisma.timeEntry.findMany()).length).toBe(1);
        expect((await prisma.timeEntry.findFirst())?.name).toBe('updated-name');
    });

    test(`owner can edit someone's time entry`, async () => {
        mockSession(owner);
        const { id } = await prisma.timeEntry.create({ data: { name: '', start: new Date(), organizationId: orgId, memberId: employee } });
        const res = await manualTimeEntry({ name: 'updated-name', timeEntryId: id });
        expect(res.success).toBe(true);
        expect((await prisma.timeEntry.findMany()).length).toBe(1);
        expect((await prisma.timeEntry.findFirst())?.name).toBe('updated-name');
    });
});
