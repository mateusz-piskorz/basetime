'use client';

import ConfirmDialog from '@/components/common/confirm-dialog';
import { DataTable } from '@/components/common/data-table';
import { DataTableViewOptions } from '@/components/common/data-table/data-table-view-options';
import { InvitationStatusFilter } from '@/components/common/invitation-status-filter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDayjs } from '@/lib/hooks/use-dayjs';
import { useMember } from '@/lib/hooks/use-member';
import { useTable } from '@/lib/hooks/use-table';
import { useTablePagination } from '@/lib/hooks/use-table-pagination';
import { useTableSorting } from '@/lib/hooks/use-table-sorting';
import { updateInvStatus } from '@/lib/server-actions/invitation';
import { trpc } from '@/lib/trpc/client';
import { INVITATION_STATUS } from '@prisma/client';
import { debounce } from 'lodash';
import { useState } from 'react';
import { toast } from 'sonner';
import { getColumns } from './columns';
import { CreateInvitationDialog } from './create-invitation-dialog';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
};

export const TableInvitations = ({ open, setOpen }: Props) => {
    const [q, setQ] = useState('');
    const { dayjs } = useDayjs();
    const { orgId } = useMember();
    const [status, setStatus] = useState<INVITATION_STATUS[]>([]);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const { order_column, order_direction, sortingProp } = useTableSorting();
    const { limit, page } = useTablePagination();

    const { data: invitations, refetch } = trpc.invitations.useQuery({
        orgId,
        limit,
        page,
        status,
        order_column,
        order_direction,
    });

    const handleCancelInvitation = async (invitationId: string) => {
        const res = await updateInvStatus({ invitationId, status: 'CANCELED' });
        if (!res.success) {
            toast.error(res.message);
            return;
        }
        toast.success('Invitation canceled successfully');
        refetch();
        setOpenConfirm(false);
    };

    const { table } = useTable({
        columns: getColumns({
            handleCancel: async (invitationId: string) => {
                setSelectedId(invitationId);
                setOpenConfirm(true);
            },
            dayjs,
        }),
        data: invitations?.data,
        sortingProp,
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
                className="mt-4"
                table={table}
                totalPages={invitations?.totalPages}
                toolbar={
                    <div className="flex flex-wrap justify-between gap-4">
                        <div className="flex gap-4">
                            <Input
                                placeholder="Search"
                                onChange={debounce((event) => setQ(event.target.value), 300)}
                                defaultValue={q || ''}
                                className="min-w-[150px] rounded md:max-w-xs"
                            />
                            <InvitationStatusFilter setStatus={setStatus} status={status} />
                        </div>
                        <div className="flex gap-4">
                            <DataTableViewOptions table={table} />
                            <Button
                                onClick={() => {
                                    setSelectedId(undefined);
                                    setOpen(true);
                                }}
                            >
                                Sent new invitation
                            </Button>
                        </div>
                    </div>
                }
            />
        </>
    );
};
