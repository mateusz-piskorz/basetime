'use client';

import ConfirmDialog from '@/components/common/confirm-dialog';
import { DataTable } from '@/components/common/data-table';
import { useMember } from '@/lib/hooks/use-member';
import { removeTimeEntry } from '@/lib/server-actions/time-entry';
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
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const order_column = searchParams.get('order_column');
    const order_direction = searchParams.get('order_direction');

    const { data, isLoading, error, refetch } = trpc.getMemberTimeEntries.useQuery({ memberId: id, limit, page, order_column, order_direction });

    // const q = searchParams.get('q');
    // const vat_rate = searchParams.getAll('vat_rate');
    // const measure_unit = searchParams.getAll('measure_unit');

    // const { data, refetch } = useQuery({
    //     queryKey: ['product-list', page, limit, q, order_column, order_direction, vat_rate, measure_unit],
    //     queryFn: () =>
    //         api['products.index']({
    //             queries: {
    //                 limit: limit ? Number(limit) : undefined,
    //                 q,
    //                 // todo: any type
    //                 sort: order_column as any,
    //                 sort_direction: order_direction,
    //                 vat_rate,
    //                 measure_unit,
    //                 page: page ? Number(page) : undefined,
    //             },
    //         }),
    // });

    const handleDeleteProduct = async (timeEntryId: string) => {
        const res = await removeTimeEntry({ timeEntryId });
        if (!res.success) {
            toast.error(res.message);
            return;
        }
        toast.success('TimeEntry deleted successfully');
        refetch();
        setOpenConfirm(false);
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
            <ManualTimeEntryDialog open={open} onSuccess={() => refetch()} setOpen={setOpen} timeEntryId={selectedId} />

            <ConfirmDialog
                open={openConfirm}
                setOpen={setOpenConfirm}
                onContinue={async () => {
                    if (selectedId) {
                        await handleDeleteProduct(selectedId);
                    }
                }}
                title={'Are you sure you want to remove this TimeEntry'}
                description={'This action cannot be undone. TimeEntry will be permanently deleted'}
            />

            <DataTable
                totalPages={data?.totalPages}
                data={data?.data ?? []}
                columns={columns}
                addNewRecord={{
                    label: 'Add new timeEntry',
                    action: () => {
                        setSelectedId(undefined);
                        setOpen(true);
                    },
                }}
                filters={[]}
                // filters={[
                //     {
                //         filterKey: 'vat_rate',
                //         title: 'Vat rate',
                //         options: schemas.VatRate.options.map((e) => ({ label: e, value: e })),
                //     },
                //     {
                //         filterKey: 'measure_unit',
                //         title: 'Measure Unit',
                //         options: schemas.MeasureUnit.options.map((e) => ({ label: locale.enum.MEASURE_UNIT[e], value: e })),
                //     },
                // ]}
            />
        </>
    );
};
