import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { OrganizationList } from './_partials/organization-list';

export default async function OrganizationsPage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }

    return (
        <div className="space-y-8 px-4 py-8 md:px-8">
            <OrganizationList />
        </div>
    );
}
