import { prisma } from '@/lib/prisma';
import { deleteProject } from '@/lib/server-actions/project';
import { mockSession } from '@/tests/utils/mock-session';
import bcrypt from 'bcrypt';

const ownerId = 'idOwner';
const managerId = 'idManager';
const empId = 'idEmp1';
const projectId = 'projectId123';
const orgId = 'org123';

beforeEach(async () => {
    const pwHash = await bcrypt.hash('admin12345', 9);
    await prisma.user.createMany({
        data: [
            { id: ownerId, email: '1', name: 'O', password: pwHash },
            { id: managerId, email: '2', name: 'M', password: pwHash },
            { id: empId, email: '3', name: 'E', password: pwHash },
        ],
    });

    await prisma.organization.create({
        data: {
            id: orgId,
            name: 'o',
            currency: 'EUR',
            Projects: { create: { id: projectId, name: 'p', color: 'GRAY', shortName: '1' } },
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

test('employee cannot delete project', async () => {
    mockSession(empId);
    const res = await deleteProject({ projectId });
    expect(res.success).toBe(false);

    const exists = await prisma.project.findUnique({ where: { id: projectId } });
    expect(exists).not.toBeNull();
});

test('manager can delete project', async () => {
    mockSession(managerId);
    const res = await deleteProject({ projectId });
    expect(res.success).toBe(true);

    const exists = await prisma.project.findUnique({ where: { id: projectId } });
    expect(exists).toBeNull();
});

test('owner can delete project', async () => {
    mockSession(ownerId);
    const res = await deleteProject({ projectId });
    expect(res.success).toBe(true);

    const exists = await prisma.project.findUnique({ where: { id: projectId } });
    expect(exists).toBeNull();
});
