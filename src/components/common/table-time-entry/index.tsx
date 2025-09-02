'use client';

import ConfirmDialog from '@/components/common/confirm-dialog';
import { DataTable } from '@/components/common/data-table';
import { useMember } from '@/lib/hooks/use-member';
import { removeTimeEntries } from '@/lib/server-actions/time-entry';
import { trpc } from '@/lib/trpc/client';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ManualTimeEntryDialog } from '../manual-time-entry-dialog';
import { getTimeEntryColumns } from './time-entry-columns';

export const TableTimeEntry = () => {
    const { id } = useMember().member;
    const searchParams = useSearchParams();
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const [open, setOpen] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openConfirmMulti, setOpenConfirmMulti] = useState(false);
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [selectedIds, setSelectedIds] = useState<string[] | undefined>(undefined);
    const order_column = searchParams.get('order_column');
    const order_direction = searchParams.get('order_direction');
    const q = searchParams.get('q');

    const { data, refetch } = trpc.getMemberTimeEntries.useQuery({ memberId: id, limit, page, order_column, order_direction, q });

    const handleDeleteTimeEntries = async (timeEntryId: string[]) => {
        const res = await removeTimeEntries({ timeEntryId });
        if (!res.success) {
            toast.error(res.message);
            return;
        }
        toast.success('TimeEntry deleted successfully');
        refetch();
        setOpenConfirm(false);
        setOpenConfirmMulti(false);
    };

    const columns = getTimeEntryColumns({
        handleDeleteTimeEntry: (timeEntryId: string) => {
            setSelectedId(timeEntryId);
            setOpenConfirm(true);
        },
        handleEditTimeEntry: async (timeEntryId: string) => {
            const timeEntry = data?.data.find((p) => p.id === timeEntryId);
            if (!timeEntry) return;

            setSelectedId(timeEntry.id);
            setOpen(true);
        },
    });

    return (
        <>
            <ManualTimeEntryDialog
                open={open}
                setOpen={setOpen}
                selectedTimeEntry={selectedId ? data?.data.find((e) => e.id === selectedId) : undefined}
            />

            <ConfirmDialog
                open={openConfirm}
                setOpen={setOpenConfirm}
                onContinue={async () => {
                    if (selectedId) {
                        await handleDeleteTimeEntries([selectedId]);
                    }
                }}
                title="Are you sure you want to remove this TimeEntry"
                description="This action cannot be undone. TimeEntry will be permanently deleted"
            />

            <ConfirmDialog
                open={openConfirmMulti}
                setOpen={setOpenConfirmMulti}
                onContinue={async () => {
                    if (selectedIds) {
                        await handleDeleteTimeEntries(selectedIds);
                    }
                }}
                title="Are you sure you want to remove selected TimeEntries"
                description="This action cannot be undone. TimeEntries will be permanently deleted"
            />

            <DataTable
                className="rounded-none"
                totalPages={data?.totalPages}
                data={data?.data ?? []}
                columns={columns}
                onSelectedRemove={(ids) => {
                    setSelectedIds(ids);
                    setOpenConfirmMulti(true);
                }}
                addNewRecord={{
                    label: 'Add new timeEntry',
                    action: () => {
                        setSelectedId(undefined);
                        setOpen(true);
                    },
                }}
                filters={[]}
            />
        </>
    );
};
