import { Separator } from '@/components/ui/separator';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { SectionCreateOrganization } from './_partials/section-create-organization';
import { SectionMyInvitations } from './_partials/section-my-invitations';
import { SectionOrganizations } from './_partials/section-organizations';

export default async function DashboardPage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }
    return (
        <div className="space-y-8 py-8">
            <SectionOrganizations />
            <Separator />
            <SectionCreateOrganization />
            <Separator />
            <SectionMyInvitations />
        </div>
    );
}
