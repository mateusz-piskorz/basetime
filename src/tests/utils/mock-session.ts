import { getSession } from '@/lib/session';
import { USER_ROLE } from '@prisma/client';
const mockedGetSession = getSession as jest.Mock;

export const mockSession = (userId?: string, { avatarId, role }: { role?: USER_ROLE; avatarId?: string } = {}) =>
    mockedGetSession.mockReturnValueOnce({ userId, role, avatarId });
