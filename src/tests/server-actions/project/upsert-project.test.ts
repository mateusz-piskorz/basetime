import { prisma } from '@/lib/prisma';
import { upsertProject } from '@/lib/server-actions/project';
import { mockSession } from '@/tests/utils/mock-session';
import bcrypt from 'bcrypt';

const ownerId = 'idOwner';
const managerId = 'idManager';
const empId = 'idEmp1';
const orgId = 'organizationId123';
const projectId = 'projectId123';

beforeEach(async () => {
    const pwHash = await bcrypt.hash('admin12345', 9);
    await prisma.user.createMany({
        data: [
            { id: ownerId, email: '1', name: 'Owner', password: pwHash },
            { id: managerId, email: '2', name: 'Manager', password: pwHash },
            { id: empId, email: '3', name: 'Emp', password: pwHash },
        ],
    });

    await prisma.organization.create({
        data: {
            id: orgId,
            name: 'o',
            currency: 'EUR',
            Projects: { create: { id: projectId, name: 'p1', color: 'GRAY', shortName: '1' } },
            Members: {
                createMany: {
                    data: [
                        { userId: ownerId, role: 'OWNER' },
                        { userId: managerId, role: 'MANAGER' },
                        { userId: empId, role: 'EMPLOYEE' },
                    ],
                },
            },
        },
    });
});

test('employee cannot update project', async () => {
    mockSession(empId);
    const res = await upsertProject({ orgId, projectId, color: 'ORANGE', shortName: '44' });
    expect(res.success).toBe(false);
});

test('manager can update project', async () => {
    mockSession(managerId);
    const res = await upsertProject({ orgId, projectId, color: 'ORANGE', shortName: '55' });
    expect(res.success).toBe(true);
    expect(res.data?.color).toBe('ORANGE');
});

test('owner can update project', async () => {
    mockSession(ownerId);
    const res = await upsertProject({ orgId, projectId, color: 'BLUE', shortName: '66' });
    expect(res.success).toBe(true);
    expect(res.data?.color).toBe('BLUE');
});

test('owner can create project', async () => {
    mockSession(ownerId);
    const res = await upsertProject({ orgId, color: 'GRAY', name: 'new project', shortName: '77' });
    expect(res.success).toBe(true);
    expect(res.data?.name).toBe('new project');
});

test('manager can create project', async () => {
    mockSession(managerId);
    const res = await upsertProject({ orgId, color: 'BLUE', name: 'new project2', shortName: '88' });
    expect(res.success).toBe(true);
    expect(res.data?.name).toBe('new project2');
});
