import { execSync } from 'child_process';
// it's executed before every .test.ts file

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
