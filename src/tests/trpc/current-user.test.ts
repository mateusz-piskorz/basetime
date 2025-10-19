import { getSession } from '@/lib/session';
import { getQueryClient, trpc } from '@/lib/trpc/server-client';

const mockedGetSession = getSession as jest.Mock;
const queryClient = getQueryClient();

afterEach(() => {
    queryClient.clear();
});

test('returns current user', async () => {
    mockedGetSession.mockReturnValueOnce({ email: 'test-email' });
    const res = await queryClient.fetchQuery(trpc.currentUser.queryOptions());

    expect(res?.email).toBe('test-email');
});
