import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { LogoutButton } from './_partials/logout-button';

export default async function DashboardPage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }
    return (
        <div>
            Dashboard
            {user?.email}
            <LogoutButton />
        </div>
    );
}
