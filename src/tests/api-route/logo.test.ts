import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/utils/encrypt';
import dayjs from 'dayjs';
import { getStatObject } from '../../lib/minio';
import { API_BASE_URL } from '../utils/constants';
import { getTestFileFormData } from '../utils/example-img';

const owner = { userId: 'ouid', sessionId: 'osid' };
const employee = { userId: 'euid', sessionId: 'esid' };
const expiresAt = dayjs().add(1, 'day').toDate();
const orgId = 'oid';
const fileName = `organization/${orgId}/logo.png`;
const apiUrl = `${API_BASE_URL}/org/${orgId}/logo`;
let headersOwner: HeadersInit;
let headersEmployee: HeadersInit;

describe('logo', () => {
    beforeAll(async () => {
        const ownerSession = await encrypt({ sessionId: owner.sessionId, expiresAt });
        const employeeSession = await encrypt({ sessionId: employee.sessionId, expiresAt });
        headersOwner = { Cookie: `session=${ownerSession}` };
        headersEmployee = { Cookie: `session=${employeeSession}` };

        await prisma.user.create({
            data: { email: '1', name: '1', password: '1', id: owner.userId, Session: { create: { expiresAt, userAgent: '', id: owner.sessionId } } },
        });
        await prisma.user.create({
            data: {
                email: '2',
                name: '2',
                password: '2',
                id: employee.userId,
                Session: { create: { expiresAt, userAgent: '', id: employee.sessionId } },
            },
        });

        await prisma.organization.create({
            data: {
                id: orgId,
                currency: 'EUR',
                name: '',
                Members: {
                    createMany: {
                        data: [
                            { role: 'OWNER', userId: owner.userId },
                            { role: 'EMPLOYEE', userId: employee.userId },
                        ],
                    },
                },
            },
        });
    });

    test('employee cant update logo', async () => {
        const data = await fetch(apiUrl, {
            method: 'POST',
            body: getTestFileFormData(),
            headers: headersEmployee,
        }).then((res) => res.json());

        expect(data.success).toBe(false);
        expect(await getStatObject({ bucket: 'main', fileName })).toBe(undefined);
    });

    test('owner can update logo', async () => {
        const data = await fetch(apiUrl, {
            method: 'POST',
            body: getTestFileFormData(),
            headers: headersOwner,
        }).then((res) => res.json());

        expect(data.success).toBe(true);
        expect(await getStatObject({ bucket: 'main', fileName })).not.toBe(undefined);
    });

    test('employee cant delete logo', async () => {
        const data = await fetch(apiUrl, {
            method: 'DELETE',
            headers: headersEmployee,
        }).then((res) => res.json());

        expect(data.success).toBe(false);
        expect(await getStatObject({ bucket: 'main', fileName })).not.toBe(undefined);
    });

    test('owner can delete logo', async () => {
        const data = await fetch(apiUrl, {
            method: 'DELETE',
            headers: headersOwner,
        }).then((res) => res.json());

        expect(data.success).toBe(true);
        expect(await getStatObject({ bucket: 'main', fileName })).toBe(undefined);
    });
});
