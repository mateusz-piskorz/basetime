import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { SectionProjects } from './_partials/section-projects';

export default async function OrganizationSettingsPage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }

    return (
        <div className="space-y-8 py-8">
            <SectionProjects />
        </div>
    );
}
