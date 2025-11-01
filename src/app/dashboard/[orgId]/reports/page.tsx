import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ReportsPage } from './_partials/reports-page';

export default async function OrganizationReportsPage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }

    return <ReportsPage />;
}
