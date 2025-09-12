import { prisma } from '@/lib/prisma';
import { deleteProject, upsertProject } from '@/lib/server-actions/project';
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
const projectId = 'projectId123';
const project2Id = 'projectId1234';

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
            Projects: {
                createMany: {
                    data: [
                        { color: 'GRAY', name: 'project1', id: projectId },
                        { color: 'GRAY', name: 'project1', id: project2Id },
                    ],
                },
            },
            Members: {
                createMany: {
                    data: [
                        { role: 'OWNER', userId: owner.id, id: owner.memberId },
                        { role: 'MANAGER', userId: manager.id, id: manager.memberId },
                        { role: 'EMPLOYEE', userId: emp1.id },
                        { role: 'EMPLOYEE', userId: emp2.id, id: emp2.memberId },
                    ],
                },
            },
        },
    });
});

const mockedGetSession = getSession as jest.Mock;

// updateProject
test('employee cannot update project', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: emp1.id });
    const res = await upsertProject({ organizationId, projectId, color: 'ORANGE' });
    expect(res.success).toBe(false);
});

test('manager can update project', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: manager.id });
    const res = await upsertProject({ organizationId, projectId, color: 'ORANGE' });
    expect(res.success).toBe(true);
    expect(res.data?.color).toBe('ORANGE');
});

test('owner can update project', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: owner.id });
    const res = await upsertProject({ organizationId, projectId, color: 'BLUE' });
    expect(res.success).toBe(true);
    expect(res.data?.color).toBe('BLUE');
});

// createProject
test('owner can create project', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: owner.id });
    const projectName = 'new project';
    const res = await upsertProject({ organizationId, color: 'GRAY', name: projectName });
    expect(res.success).toBe(true);
    expect(res.data?.name).toBe(projectName);
});

test('manager can create project', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: manager.id });
    const projectName = 'new project2';
    const res = await upsertProject({ organizationId, color: 'BLUE', name: projectName });
    expect(res.success).toBe(true);
    expect(res.data?.name).toBe(projectName);
});

// deleteProject
test('employee cannot delete project', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: emp1.id });
    const res = await deleteProject({ projectId });
    expect(res.success).toBe(false);
});

test('manager can delete project', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: manager.id });
    const res = await deleteProject({ projectId });
    expect(res.success).toBe(true);
});

test('owner can delete project', async () => {
    mockedGetSession.mockReturnValueOnce({ userId: owner.id });
    const res = await deleteProject({ projectId: project2Id });
    expect(res.success).toBe(true);
});
