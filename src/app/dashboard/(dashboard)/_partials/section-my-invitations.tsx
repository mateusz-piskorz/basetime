'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { SpinLoader } from '@/components/common/spin-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { acceptInvitation, rejectInvitation } from '@/lib/server-actions/invitation';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';
import { MailOpen } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export const SectionMyInvitations = () => {
    const trpcUtils = trpc.useUtils();
    const [loading, setLoading] = useState(false);

    const { data, isLoading, error, refetch } = trpc.getUserInvitations.useQuery();

    const handleAction = async (invitationId: string, organizationId: string, status: 'accepted' | 'rejected') => {
        setLoading(true);
        let res;
        if (status === 'accepted') {
            res = await acceptInvitation({ invitationId, organizationId });
        } else {
            res = await rejectInvitation({ invitationId });
        }
        if (!res.success) {
            toast.error(res.message);
            setLoading(false);
            return;
        }

        toast.success(`invitation ${status}`);
        setLoading(false);
        refetch();
        trpcUtils.getUserOrganizations.refetch();
    };

    return (
        <>
            <div className="space-y-8 px-4 md:px-8">
                <DashboardHeading className="mb-8" title="Invitations" description="Here you can preview invitations and join a team" />

                <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-8">
                    {error && <p className="text-red-500">Error loading members</p>}
                    {!error && isLoading && <SpinLoader />}
                    {!error &&
                        !isLoading &&
                        data?.map(({ id, status, createdAt, Organization }) => {
                            return (
                                <Card key={id} className="w-full md:max-w-[325px]">
                                    <CardContent className="space-y-6">
                                        <MailOpen size={50} />
                                        <div className="flex gap-4">
                                            <h2>{Organization.name}</h2>
                                            <span
                                                className={cn(status === 'REJECTED' && 'text-destructive', status === 'ACCEPTED' && 'text-green-500')}
                                            >
                                                {status}
                                            </span>
                                        </div>
                                        {status === 'SENT' && (
                                            <div className="space-x-4">
                                                <Button
                                                    disabled={loading}
                                                    onClick={() => handleAction(id, Organization.id, 'rejected')}
                                                    variant="destructive"
                                                >
                                                    Reject
                                                </Button>
                                                <Button disabled={loading} onClick={() => handleAction(id, Organization.id, 'accepted')}>
                                                    Accept
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                </div>
            </div>
        </>
    );
};
