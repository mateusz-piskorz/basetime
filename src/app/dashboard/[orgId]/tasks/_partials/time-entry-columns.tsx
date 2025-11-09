'use client';

import { DataTableColumnHeader } from '@/components/common/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/common/data-table/data-table-row-actions';
import { Checkbox } from '@/components/ui/checkbox';
import { TrpcRouterOutput } from '@/lib/trpc/client';
import { ColumnDef } from '@tanstack/react-table';

export const getTimeEntryColumns = ({
    handleEditTask,
    handleDeleteTask,
}: {
    handleEditTask: (taskId: string) => void;
    handleDeleteTask: (taskId: string) => void;
}): ColumnDef<NonNullable<TrpcRouterOutput['tasksPaginated']>['data'][number]>[] => [
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
        accessorKey: 'assigned',
        meta: { title: 'AssignedId' },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => row.original.assignedId,
        enableSorting: false,
    },

    {
        id: 'actions',
        cell: ({ row }) => (
            <DataTableRowActions
                actions={[
                    { label: 'Edit task', action: () => handleEditTask(row.original.id) },
                    { label: 'Delete task', action: () => handleDeleteTask(row.original.id) },
                ]}
            />
        ),
    },
];
