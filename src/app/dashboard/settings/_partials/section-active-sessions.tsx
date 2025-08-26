'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';

export const SectionActiveSessions = () => {
    return (
        <div className="space-y-8 px-4 md:px-8">
            <DashboardHeading className="mb-8" title="Active sessions" description="View and manage devices currently signed in to your account." />

            {/* TODO: List active sessions here */}
        </div>
    );
};
