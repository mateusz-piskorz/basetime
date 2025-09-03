'use client';

import ConfirmDialog from '@/components/common/confirm-dialog';
import { DataTable } from '@/components/common/data-table';
import { useMember } from '@/lib/hooks/use-member';
import { cancelInvitation } from '@/lib/server-actions/invitation';
import { trpc } from '@/lib/trpc/client';
import { INVITATION_STATUS } from '@prisma/client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { CreateInvitationDialog } from '../common/create-invitation-dialog';
import { getInvitationsColumns } from './invitations-columns';

export const TableInvitations = () => {
    const { organizationId } = useMember();
    const searchParams = useSearchParams();
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const [open, setOpen] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const order_column = searchParams.get('order_column');
    const order_direction = searchParams.get('order_direction');
    const statusArr = searchParams.getAll('status') as INVITATION_STATUS[];

    const { data, refetch } = trpc.getOrganizationInvitations.useQuery({ organizationId, limit, page, order_column, order_direction, statusArr });

    const handleCancelInvitation = async (invitationId: string) => {
        const res = await cancelInvitation({ invitationId });
        if (!res.success) {
            toast.error(res.message);
            return;
        }
        toast.success('Invitation canceled successfully');
        refetch();
        setOpenConfirm(false);
    };

    const columns = getInvitationsColumns({
        handleCancel: async (invitationId: string) => {
            setSelectedId(undefined);
            handleCancelInvitation(invitationId);
        },
    });

    return (
        <>
            <CreateInvitationDialog open={open} setOpen={setOpen} />

            <ConfirmDialog
                open={openConfirm}
                setOpen={setOpenConfirm}
                onContinue={async () => {
                    if (selectedId) {
                        await handleCancelInvitation(selectedId);
                    }
                }}
                title="Are you sure you want to cancel invitation"
                description="This action cannot be undone. Invitation will be canceled permanently"
            />

            <DataTable
                displaySearchBar={false}
                className="rounded-none"
                totalPages={data?.totalPages}
                data={data?.data ?? []}
                columns={columns}
                addNewRecord={{
                    label: 'Create invitation',
                    action: () => {
                        setSelectedId(undefined);
                        setOpen(true);
                    },
                }}
                filters={[{ filterKey: 'status', options: Object.values(INVITATION_STATUS).map((e) => ({ label: e, value: e })), title: 'Status' }]}
            />
        </>
    );
};
