import { getSession } from '@/lib/session';
const mockedGetSession = getSession as jest.Mock;

export const mockSession = (userId: string) => mockedGetSession.mockReturnValueOnce({ userId });
