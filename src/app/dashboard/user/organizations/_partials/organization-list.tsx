'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { SpinLoader } from '@/components/common/spin-loader';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { CreateOrganizationDialog } from './create-organization-dialog';
import { OrganizationCard } from './organization-card';

export const OrganizationList = () => {
    const [open, setOpen] = useState(false);
    const { data, isLoading, error } = trpc.getUserOrganizations.useQuery();

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-x-4">
                <DashboardHeading title="Organizations" description="View and manage your organizations" />
                <Button onClick={() => setOpen(true)}>Create organization</Button>
            </div>
            <div className="space-y-8 py-4">
                <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-8">
                    {error && <p className="text-red-500">Error loading organizations</p>}
                    {!error && isLoading && <SpinLoader />}
                    {!error && !isLoading && data?.map((organization) => <OrganizationCard key={organization.id} organization={organization} />)}
                </div>
            </div>
            <CreateOrganizationDialog open={open} setOpen={setOpen} />
        </>
    );
};
