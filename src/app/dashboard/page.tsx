import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }
    return (
        <div>
            Dashboard
            {user?.email}
        </div>
    );
}
