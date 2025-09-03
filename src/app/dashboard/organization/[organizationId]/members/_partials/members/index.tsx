'use client';

import ConfirmDialog from '@/components/common/confirm-dialog';
import { SpinLoader } from '@/components/common/spin-loader';
import { useMember } from '@/lib/hooks/use-member';
import { removeMember } from '@/lib/server-actions/member';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { toast } from 'sonner';
import { MemberCard } from './member-card';
import { UpdateMemberDialog } from './update-member-dialog';

export const MemberList = () => {
    const { organizationId } = useMember();

    const [open, setOpen] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { data, error, isLoading, refetch } = trpc.getMembers.useQuery({ organizationId });

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

            <div className="space-y-8 px-4 md:px-8">
                <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:gap-8">
                    {error && <p className="text-red-500">Error loading members</p>}
                    {!error && isLoading && <SpinLoader />}
                    {!error &&
                        !isLoading &&
                        data?.map((member) => {
                            return (
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
                            );
                        })}
                </div>
            </div>
        </>
    );
};
