'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { SpinLoader } from '@/components/common/spin-loader';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { CreateOrganizationDialog } from './create-organization-dialog';
import { EmptyOrganizationsState } from './empty-organizations-otate';
import { OrganizationCard } from './organization-card';

export const OrganizationList = () => {
    const [open, setOpen] = useState(false);
    const { data, isLoading, isError } = trpc.organizations.useQuery({});

    return (
        <>
            <div className="flex flex-wrap items-center justify-between gap-x-4">
                <DashboardHeading title="Organizations" description="View and manage your organizations" />
                <Button onClick={() => setOpen(true)}>Create organization</Button>
            </div>

            <div className="space-y-8">
                <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-8">
                    {isError && <p className="text-red-500">Error loading organizations</p>}
                    {isLoading && <SpinLoader />}
                    {!isError && !isLoading && (
                        <>
                            {data?.length ? (
                                data?.map((organization) => {
                                    return <OrganizationCard key={organization.id} organization={organization} />;
                                })
                            ) : (
                                <EmptyOrganizationsState openCreateOrganizationDialog={() => setOpen(true)} />
                            )}
                        </>
                    )}
                </div>
            </div>

            <CreateOrganizationDialog open={open} setOpen={setOpen} />
        </>
    );
};
