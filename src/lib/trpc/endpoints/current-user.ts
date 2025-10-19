import { getSession } from '@/lib/session';
import { publicProcedure } from '../init';

export const currentUser = publicProcedure.query(async () => {
    const session = await getSession();
    if (!session) return null;
    return { email: session.email };
});
