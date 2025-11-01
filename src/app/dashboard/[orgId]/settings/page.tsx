import { Separator } from '@/components/ui/separator';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { SectionDeleteOrg } from './_partials/section-delete-org';
import { SectionOrgInfo } from './_partials/section-org-info';
import { SectionOrgLogo } from './_partials/section-org-logo';

export default async function OrgSettingsPage() {
    if (!(await getSession())) return redirect('/');

    return (
        <div className="space-y-12 py-12">
            <SectionOrgInfo />
            <Separator />
            <SectionOrgLogo />
            <Separator />
            <SectionDeleteOrg />
        </div>
    );
}
