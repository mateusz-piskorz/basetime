import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { OrganizationDashboard } from './_partials/organization-dashboard';

export default async function OverviewPage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }
    return <OrganizationDashboard />;
}
