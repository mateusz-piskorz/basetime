import { DashboardHeading } from '@/components/common/dashboard-heading';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { TableUserInvitations } from './_partials/table-user-invitations';

export default async function InvitationsPage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }

    return (
        <div className="space-y-8 px-4 py-8 md:px-8">
            <DashboardHeading title="Invitations" description="Preview and manage your invitations" />
            <TableUserInvitations />
        </div>
    );
}
