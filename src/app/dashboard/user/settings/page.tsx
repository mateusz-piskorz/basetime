import { getSession } from '@/lib/session';

import { Separator } from '@/components/ui/separator';
import { redirect } from 'next/navigation';
import { SectionActiveSessions } from './_partials/section-active-sessions';
import { SectionAppearance } from './_partials/section-appearance';
import { SectionAvatar } from './_partials/section-avatar';
import { SectionDeleteUserAccount } from './_partials/section-delete-user-account';
import { SectionPassword } from './_partials/section-password';
import { SectionProfileInfo } from './_partials/section-profile-info';

export default async function SettingsPage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }
    return (
        <div className="space-y-8 py-8">
            <SectionAppearance />
            <Separator />
            <SectionProfileInfo />
            <Separator />
            <SectionAvatar />
            <Separator />
            <SectionPassword />
            <Separator />
            <SectionActiveSessions />
            <Separator />
            <SectionDeleteUserAccount />
        </div>
    );
}
