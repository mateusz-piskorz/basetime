'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { SpinLoader } from '@/components/common/spin-loader';
import { trpc } from '@/lib/trpc/client';
import { SessionCard } from './session-card';

export const SectionActiveSessions = () => {
    const { data, isLoading, isError } = trpc.activeSessions.useQuery();

    return (
        <div className="space-y-8 px-4 md:px-8">
            <DashboardHeading className="mb-8" title="Active sessions" description="View and manage devices currently signed in to your account." />
            <div className="space-y-4">
                {isError && <p className="text-red-500">Error loading active sessions</p>}
                {isLoading && <SpinLoader />}
                {!isError && data?.map((session) => <SessionCard key={session.id} session={session} />)}
            </div>
        </div>
    );
};
