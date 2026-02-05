import { logout } from '@/lib/server-actions/auth';
import { deleteSession } from '@/lib/session';

test('User can logout', async () => {
    const sessionId = 'sessionId123';
    const res = await logout({ sessionId });

    expect(res.success).toBe(true);
    expect(deleteSession).toHaveBeenCalledWith(sessionId);
});
