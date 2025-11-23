'use client';
import React from 'react';

import { DataTable } from '@/components/common/data-table';
import { DataTableViewOptions } from '@/components/common/data-table/data-table-view-options';
import { InvitationStatusFilter } from '@/components/common/invitation-status-filter';
import { Input } from '@/components/ui/input';
import { dayjs } from '@/lib/dayjs';
import { useTable } from '@/lib/hooks/use-table';
import { useTablePagination } from '@/lib/hooks/use-table-pagination';
import { updateInvStatus } from '@/lib/server-actions/invitation';
import { trpc } from '@/lib/trpc/client';
import { INVITATION_STATUS } from '@prisma/client';
import { debounce } from 'lodash';
import { toast } from 'sonner';
import { getColumns } from './columns';

export const UserInvitationsTable = () => {
    const trpcUtils = trpc.useUtils();
    const { limit, page } = useTablePagination();
    const [q, setQ] = React.useState('');
    const [status, setStatus] = React.useState<INVITATION_STATUS[]>([]);

    const { data: invitations, refetch } = trpc.invitations.useQuery({ page, limit, status, q, queryColumn: 'ORGANIZATION_NAME' });

    const { table } = useTable({
        columns: getColumns({
            handleAction: async ({ action, invitationId }) => {
                const res = await updateInvStatus({ invitationId, status: action === 'accepted' ? 'ACCEPTED' : 'REJECTED' });

                if (!res.success) {
                    toast.error(res.message);
                    return;
                }

                toast.success(`invitation ${action}`);
                refetch();
                trpcUtils.organizations.refetch();
            },
            dayjs,
        }),
        data: invitations?.data,
    });

    return (
        <>
            <DataTable
                table={table}
                className="my-4"
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
                        <DataTableViewOptions table={table} />
                    </div>
                }
            />
        </>
    );
};
