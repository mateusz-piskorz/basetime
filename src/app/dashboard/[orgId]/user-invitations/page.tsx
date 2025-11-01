import { DashboardHeading } from '@/components/common/dashboard-heading';
import { UserInvitationsTable } from '@/components/common/user-invitations-table';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function InvitationsPage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }

    return (
        <div className="space-y-8 px-4 py-8 md:px-8">
            <DashboardHeading title="Invitations" description="Preview and manage your invitations" />
            <UserInvitationsTable />
        </div>
    );
}
