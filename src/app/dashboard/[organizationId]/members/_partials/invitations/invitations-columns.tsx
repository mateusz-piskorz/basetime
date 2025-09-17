'use client';

import { DataTableColumnHeader } from '@/components/common/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/common/data-table/data-table-row-actions';
import { InvitationStatusBadge } from '@/components/common/invitation-status-badge';

import { TrpcRouterOutput } from '@/lib/trpc/client';
import { ColumnDef } from '@tanstack/react-table';

export const getInvitationsColumns = ({
    handleCancel,
    dayjs,
}: {
    handleCancel: (invitationId: string) => void;
    dayjs: typeof import('dayjs');
}): ColumnDef<NonNullable<TrpcRouterOutput['invitations']>['data'][number]>[] => [
    {
        accessorKey: 'User_email',
        meta: { title: 'User Email' },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => row.original.User.email,
        enableSorting: false,
    },
    {
        accessorKey: 'status',
        meta: { title: 'Status' },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => <InvitationStatusBadge status={row.original.status} />,
    },
    {
        accessorKey: 'createdAt',
        meta: { title: 'Created At' },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => dayjs(row.original.createdAt).format('DD-MM-YYYY'),
    },
    {
        id: 'actions',
        cell: ({ row }) => (
            <DataTableRowActions
                actions={[
                    { disabled: !['SENT'].includes(row.original.status), label: 'Cancel invitation', action: () => handleCancel(row.original.id) },
                ]}
            />
        ),
    },
];
