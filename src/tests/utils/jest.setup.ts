import { prisma } from '@/lib/prisma';
import { minioClient } from '../../lib/minio';

jest.mock('next/cache', () => ({ revalidatePath: () => {} }));
jest.mock('@paralleldrive/cuid2', () => ({ createId: () => Math.random().toString(36).slice(2) }));
jest.mock('server-only', () => ({}));
jest.mock('@/lib/session', () => {
    const mockGetSession = jest.fn();
    const mockDeleteSession = jest.fn();
    const mockCreateSession = jest.fn();
    mockGetSession.mockReturnValue(null);
    return {
        getSession: mockGetSession,
        deleteSession: mockDeleteSession,
        createSession: mockCreateSession,
        setSessionCookie: () => null,
    };
});

async function clearBucket(bucketName: string) {
    try {
        const exists = await minioClient.bucketExists(bucketName);
        if (!exists) return;

        const objectsList: string[] = [];
        const stream = minioClient.listObjects(bucketName, '', true);

        for await (const obj of stream) {
            if (obj.name) objectsList.push(obj.name);
        }

        if (objectsList.length > 0) {
            await minioClient.removeObjects(bucketName, objectsList);
        }
    } catch (error) {
        console.error(`Błąd podczas czyszczenia bucketu ${bucketName}:`, error);
    }
}

async function resetMinio() {
    await Promise.all([clearBucket('public'), clearBucket('main')]);
}

async function resetDb() {
    const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '_prisma_migrations';
  `;

    const tables = tablenames.map(({ tablename }) => `"${tablename}"`).join(', ');

    try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
    } catch (error) {
        console.error('Błąd podczas czyszczenia bazy:', error);
    }
}

beforeEach(async () => {
    await resetDb();
    await resetMinio();
});
