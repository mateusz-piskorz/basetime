'use client';

import { AppearanceToggle } from '@/components/common/appearance-toggle';
import { DashboardHeading } from '@/components/common/dashboard-heading';

export const SectionAppearance = () => {
    return (
        <div className="space-y-8 px-4 md:px-8">
            <DashboardHeading className="mb-8" title="Appearance settings" description="Update your account's appearance settings" />
            <div className="flex gap-8">
                <div>
                    <h4 className="mb-2">Theme</h4>
                    <AppearanceToggle />
                </div>
            </div>
        </div>
    );
};
