import { Separator } from '@/components/ui/separator';
import { SectionActiveSessions } from './_partials/section-active-sessions';
import { SectionAppearance } from './_partials/section-appearance';
import { SectionAvatar } from './_partials/section-avatar';
import { SectionDeleteUserAccount } from './_partials/section-delete-user-account';
import { SectionPassword } from './_partials/section-password';
import { SectionProfileInfo } from './_partials/section-profile-info';

export const UserSettings = () => {
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
};
