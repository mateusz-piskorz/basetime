'use client';

import { DataTableColumnHeader } from '@/components/common/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/common/data-table/data-table-row-actions';
import { TrpcRouterOutput } from '@/lib/trpc/client';
import { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { InvitationStatusBadge } from './invitation-status-badge';

export const getInvitationsColumns = ({
    handleCancel,
}: {
    handleCancel: (invitationId: string) => void;
}): ColumnDef<NonNullable<TrpcRouterOutput['getOrganizationInvitations']>['data'][number]>[] => [
    {
        accessorKey: 'user_email',
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
        cell: ({ row }) => <DataTableRowActions actions={[{ label: 'Cancel invitation', action: () => handleCancel(row.original.id) }]} />,
    },
];
