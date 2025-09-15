'use client';

import { DataTableColumnHeader } from '@/components/common/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/common/data-table/data-table-row-actions';
import { InvitationStatusBadge } from '@/components/common/invitation-status-badge';
import { TrpcRouterOutput } from '@/lib/trpc/client';
import { ColumnDef } from '@tanstack/react-table';

export const getInvitationsColumns = ({
    handleAction,
    dayjs,
}: {
    handleAction: (args: { invitationId: string; action: 'accepted' | 'rejected' }) => void;
    dayjs: typeof import('dayjs');
}): ColumnDef<NonNullable<TrpcRouterOutput['getInvitations']>['data'][number]>[] => [
    {
        accessorKey: 'Organization_name',
        meta: { title: 'Organization Name' },
        header: ({ column }) => <DataTableColumnHeader column={column} />,
        cell: ({ row }) => row.original.Organization.name,
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
                    {
                        disabled: !['SENT'].includes(row.original.status),
                        label: 'Accept',
                        action: () => handleAction({ invitationId: row.original.id, action: 'accepted' }),
                    },
                    {
                        disabled: !['SENT'].includes(row.original.status),
                        label: 'Reject',
                        action: () => handleAction({ invitationId: row.original.id, action: 'rejected' }),
                    },
                ]}
            />
        ),
    },
];
