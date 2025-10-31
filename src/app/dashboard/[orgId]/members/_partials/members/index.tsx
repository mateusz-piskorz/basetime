'use client';

import ConfirmDialog from '@/components/common/confirm-dialog';
import { SpinLoader } from '@/components/common/spin-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMember } from '@/lib/hooks/use-member';
import { removeMember } from '@/lib/server-actions/member';
import { trpc } from '@/lib/trpc/client';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { MemberCard } from './member-card';
import { UpdateMemberDialog } from './update-member-dialog';

type Props = {
    openInvitationDialog: () => void;
};

export const MemberList = ({ openInvitationDialog }: Props) => {
    const {
        orgId,
        member: { role },
    } = useMember();

    const [open, setOpen] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { data, error, isLoading, refetch } = trpc.members.useQuery({ orgId });

    const selectedMember = data?.find((e) => e.id === selectedId);

    const handleRemoveMember = async (memberId: string) => {
        const res = await removeMember({ memberId });
        if (!res.success) {
            toast.error(res.message);
            return;
        }
        toast.success('Member removed successfully');
        refetch();
        setOpenConfirm(false);
        setSelectedId(null);
    };

    return (
        <>
            {selectedMember && (
                <>
                    <UpdateMemberDialog
                        open={open}
                        setOpen={setOpen}
                        onSuccess={() => {
                            setSelectedId(null);
                        }}
                        member={selectedMember}
                    />
                    <ConfirmDialog
                        open={openConfirm}
                        setOpen={setOpenConfirm}
                        onContinue={async () => {
                            handleRemoveMember(selectedMember.id);
                        }}
                        title={`Are you sure you want to delete ${selectedMember.User.email}`}
                        description="This action cannot be undone. Member and all logged time will be removed permanently"
                    />
                </>
            )}

            <div className="space-y-8 py-4">
                <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-8">
                    {error && <p className="text-red-500">Error loading members</p>}
                    {!error && isLoading && <SpinLoader />}
                    {!error && !isLoading && (
                        <>
                            {data?.map((member) => (
                                <MemberCard
                                    key={member.id}
                                    member={member}
                                    deleteMember={(memberId) => {
                                        setSelectedId(memberId);
                                        setOpenConfirm(true);
                                    }}
                                    manageMember={(memberId) => {
                                        setSelectedId(memberId);
                                        setOpen(true);
                                    }}
                                />
                            ))}
                            {role !== 'EMPLOYEE' && (
                                <Card variant="outline-light-theme" className="w-full md:max-w-[325px]">
                                    <CardContent className="flex h-full min-h-[200px] items-center justify-center">
                                        <Button onClick={openInvitationDialog} className="h-14 w-14">
                                            <Plus className="size-8" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};
