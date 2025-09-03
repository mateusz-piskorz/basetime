'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { SpinLoader } from '@/components/common/spin-loader';
import { UserInfo } from '@/components/common/user-info';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { trpc } from '@/lib/trpc/client';
import { MEMBER_ROLE } from '@prisma/client';
import { Clock, FolderClosed } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { UpdateMemberHourlyRateDialog } from './update-member-hourly-rate-dialog';
import { UpdateMemberRoleDialog } from './update-member-role-dialog';

export const MembersTab = () => {
    const [openRole, setOpenRole] = useState(false);
    const [open, setOpen] = useState(false);
    const { organizationId } = useParams<{ organizationId: string }>();

    const { data, error, isLoading } = trpc.getMembers.useQuery({ organizationId });

    const [selected, setSelected] = useState<{ id: string; hourlyRate?: number; userName: string; role: MEMBER_ROLE } | null>(null);

    return (
        <>
            {selected && (
                <UpdateMemberRoleDialog
                    open={openRole}
                    setOpen={setOpenRole}
                    onSuccess={() => {
                        setSelected(null);
                    }}
                    memberId={selected.id}
                    userName={selected.userName}
                    defaultValues={{ role: selected.role }}
                />
            )}
            {selected && (
                <UpdateMemberHourlyRateDialog
                    open={open}
                    setOpen={setOpen}
                    onSuccess={() => {
                        setSelected(null);
                    }}
                    memberId={selected.id}
                    userName={selected.userName}
                    defaultValues={{ hourlyRate: selected.hourlyRate || 0 }}
                />
            )}
            <div className="space-y-8 px-4 md:px-8">
                <DashboardHeading className="mb-8" title="Members" description="Preview and Manage organization members" />
                <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-8">
                    {error && <p className="text-red-500">Error loading members</p>}
                    {!error && isLoading && <SpinLoader />}
                    {!error &&
                        !isLoading &&
                        data?.map(({ id, User, role, loggedTime, _count, hourlyRate }) => {
                            return (
                                <React.Fragment key={id}>
                                    <Card className="w-full md:max-w-[325px]">
                                        <CardContent className="space-y-6">
                                            <div className="flex gap-2">
                                                <UserInfo showEmail user={User} />
                                                {role}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
                                                <div className="flex items-center gap-2">
                                                    <Clock size={16} className="text-muted-foreground" /> {loggedTime}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <FolderClosed size={16} className="text-muted-foreground" /> {_count.Projects}
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    setSelected({ hourlyRate, id, role, userName: User.name });
                                                    setOpenRole(true);
                                                }}
                                            >
                                                update role
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setSelected({ hourlyRate, id, role, userName: User.name });
                                                    setOpen(true);
                                                }}
                                            >
                                                update hourly rate
                                            </Button>
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
