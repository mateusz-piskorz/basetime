'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { SpinLoader } from '@/components/common/spin-loader';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';

export const SectionOrganizations = () => {
    const { data, isLoading, isError } = trpc.getUserOrganizations.useQuery();
    return (
        <div className="space-y-8 px-4 md:px-8">
            <DashboardHeading className="mb-8" title="Organizations" description="Preview and manage your organizations" />
            <div>
                {isError && <p className="text-red-500">Error loading organizations</p>}
                {!isError && isLoading && <SpinLoader />}
                {!isError &&
                    !isLoading &&
                    data?.map(({ id, name, PersonalOwner }) => {
                        const isPersonal = PersonalOwner?.id;
                        return (
                            <Link key={id} href={`dashboard/organization/${id}`}>
                                <Card>
                                    <CardContent>
                                        {name} {isPersonal && <span className="text-muted-foreground">(personal organization)</span>}
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
            </div>
        </div>
    );
};
