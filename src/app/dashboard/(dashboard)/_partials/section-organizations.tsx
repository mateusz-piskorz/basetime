'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { SpinLoader } from '@/components/common/spin-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { Clock, FolderClosed, Users2 } from 'lucide-react';
import Link from 'next/link';

export const SectionOrganizations = () => {
    const { data, isLoading, isError } = trpc.getUserOrganizations.useQuery();
    return (
        <div className="space-y-8 px-4 md:px-8">
            <DashboardHeading className="mb-8" title="Organizations" description="Preview and manage your organizations" />
            <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-8">
                {isError && <p className="text-red-500">Error loading organizations</p>}
                {!isError && isLoading && <SpinLoader />}
                {!isError &&
                    !isLoading &&
                    data?.map(({ id, name, PersonalOwner, loggedTime, _count }) => {
                        const isPersonal = PersonalOwner?.id;

                        return (
                            <Card key={id} className="w-full md:max-w-[325px]">
                                <CardContent className="space-y-6">
                                    <h2 className="font-semibold">
                                        {name} {isPersonal && <span className="text-muted-foreground">(personal organization)</span>}
                                    </h2>
                                    <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="text-muted-foreground" /> {loggedTime}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <FolderClosed size={16} className="text-muted-foreground" /> {_count.Projects}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users2 size={16} className="text-muted-foreground" /> {_count.Members}
                                        </div>
                                    </div>
                                    <Button>
                                        <Link href={`dashboard/organization/${id}`}>Open</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
            </div>
        </div>
    );
};
