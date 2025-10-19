import { getSession } from '@/lib/session';
import { USER_ROLE } from '@prisma/client';
const mockedGetSession = getSession as jest.Mock;

export const mockSession = (userId: string, role?: USER_ROLE) => mockedGetSession.mockReturnValueOnce({ userId, role });
