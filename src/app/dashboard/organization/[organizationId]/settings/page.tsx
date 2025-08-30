import { Separator } from '@/components/ui/separator';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { SectionInvitations } from './_partials/section-invitations';
import { SectionMembers } from './_partials/section-members';
import { SectionOrganizationInfo } from './_partials/section-organization-info';

export default async function OrganizationSettingsPage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }

    return (
        <div className="space-y-8 py-8">
            <SectionOrganizationInfo />
            <Separator />
            <SectionMembers />
            <Separator />
            <SectionInvitations />
        </div>
    );
}
