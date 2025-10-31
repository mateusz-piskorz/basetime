import { execSync } from 'child_process';
// it's executed before every .test.ts file

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

execSync('npx prisma migrate reset --force --skip-seed', { stdio: 'inherit' });
