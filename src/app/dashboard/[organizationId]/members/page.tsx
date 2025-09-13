import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { MembersTabs } from './_partials/members-tabs';

export default async function OrganizationSettingsPage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }

    return <MembersTabs />;
}
