'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { SpinLoader } from '@/components/common/spin-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { Clock, Users2 } from 'lucide-react';
import React, { useState } from 'react';
import { CreateProjectDialog } from './create-project-dialog';

export const SectionProjects = () => {
    const [open, setOpen] = useState(false);
    const { organizationId } = useMember();

    const { data, error, isLoading } = trpc.getProjects.useQuery({ organizationId });

    return (
        <>
            <CreateProjectDialog open={open} setOpen={setOpen} />
            <Button onClick={() => setOpen(true)}>Add new project</Button>
            <div className="space-y-8 px-4 md:px-8">
                <DashboardHeading className="mb-8" title="Projects" description="Preview and Manage organization Projects" />
                <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-8">
                    {error && <p className="text-red-500">Error loading members</p>}
                    {!error && isLoading && <SpinLoader />}
                    {!error &&
                        !isLoading &&
                        data?.map(({ id, loggedTime, _count, name }) => {
                            return (
                                <React.Fragment key={id}>
                                    <Card className="w-full md:max-w-[325px]">
                                        <CardContent className="space-y-6">
                                            <h2>{name}</h2>

                                            <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-muted-foreground" /> {loggedTime}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Users2 size={16} className="text-muted-foreground" /> {_count.Members}
                                                </div>
                                            </div>
                                            <Button>edytuj</Button>
                                        </CardContent>
                                    </Card>
                                </React.Fragment>
                            );
                        })}
                </div>
            </div>
        </>
    );
};
