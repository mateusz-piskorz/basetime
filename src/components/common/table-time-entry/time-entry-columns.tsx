'use client';

import { DataTableColumnHeader } from '@/components/common/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/common/data-table/data-table-row-actions';
import { Checkbox } from '@/components/ui/checkbox';
import { dayjs } from '@/lib/dayjs';
import { TrpcRouterOutput } from '@/lib/trpc/client';
import { ColumnDef } from '@tanstack/react-table';

export const getTimeEntryColumns = ({
    handleEditTimeEntry,
    handleDeleteTimeEntry,
}: {
    handleEditTimeEntry: (TimeEntryId: string) => void;
    handleDeleteTimeEntry: (TimeEntryId: string) => void;
}): ColumnDef<NonNullable<TrpcRouterOutput['getTimeEntriesPaginated']>['data'][number]>[] => [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        meta: { title: 'Name' },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => row.original.name,
        enableSorting: false,
    },
    {
        accessorKey: 'project',
        meta: { title: 'Project' },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => row.original.Project?.name,
        enableSorting: false,
    },
    {
        accessorKey: 'duration',
        meta: { title: 'Duration' },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => row.original.duration,
    },
    {
        accessorKey: 'start',
        meta: { title: 'Start' },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => dayjs(row.original.start).format('YYYY/MM/DD HH:mm'),
    },
    {
        accessorKey: 'end',
        meta: { title: 'end' },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => (row.original.end ? dayjs(row.original.end).format('YYYY/MM/DD HH:mm') : 'active'),
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <DataTableRowActions
                actions={[
                    { label: 'Edit time entry', action: () => handleEditTimeEntry(row.original.id) },
                    { label: 'Delete time entry', action: () => handleDeleteTimeEntry(row.original.id) },
                ]}
            />
        ),
    },
];
