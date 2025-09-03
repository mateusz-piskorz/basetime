'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { SpinLoader } from '@/components/common/spin-loader';
import { UserInfo } from '@/components/common/user-info';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { deleteInvitation } from '@/lib/server-actions/invitation';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { CreateInvitationDialog } from './create-invitation-dialog';

export const SectionInvitations = () => {
    const trpcUtils = trpc.useUtils();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const { organizationId } = useParams<{ organizationId: string }>();

    const { data, isLoading, error } = trpc.getOrganizationInvitations.useQuery({ organizationId });

    const handleCancel = async (invitationId: string) => {
        setLoading(true);

        const res = await deleteInvitation({ invitationId });

        if (!res.success) {
            toast.error(res.message);
        }

        toast.success('invitation canceled');
        setLoading(false);
        trpcUtils.getOrganizationInvitations.refetch();
    };

    return (
        <>
            <div className="space-y-8 px-4 md:px-8">
                <DashboardHeading className="mb-8" title="Invitations" description="Invite other users to join your team" />
                <Button onClick={() => setOpen(true)}>Create invitation</Button>
                {error && <p className="text-red-500">{error.message}</p>}
                {!error && isLoading && <SpinLoader />}

                <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-8">
                    {error && <p className="text-red-500">Error loading members</p>}
                    {!error && isLoading && <SpinLoader />}
                    {!error &&
                        !isLoading &&
                        data?.map(({ id, status, createdAt, User }) => {
                            return (
                                <Card key={id} className="w-full md:max-w-[325px]">
                                    <CardContent className="space-y-6">
                                        <div className="flex gap-2">
                                            <UserInfo showEmail user={User} />
                                            <span
                                                className={cn(status === 'REJECTED' && 'text-destructive', status === 'ACCEPTED' && 'text-green-500')}
                                            >
                                                {status}
                                            </span>
                                        </div>
                                        {status === 'SENT' && (
                                            <Button disabled={loading} onClick={() => handleCancel(id)} variant="destructive">
                                                Cancel
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                </div>
            </div>
            <CreateInvitationDialog open={open} setOpen={setOpen} />
        </>
    );
};
