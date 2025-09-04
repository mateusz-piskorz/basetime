import { Separator } from '@/components/ui/separator';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { SectionDeleteOrganization } from './_partials/section-delete-organization';
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
            <SectionDeleteOrganization />
        </div>
    );
}
