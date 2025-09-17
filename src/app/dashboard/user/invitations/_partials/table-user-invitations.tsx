'use client';

import { DataTable } from '@/components/common/data-table-new';
import { DataTableViewOptions } from '@/components/common/data-table-new/data-table-view-options';
import { MultiOptionsFilterState } from '@/components/common/multi-options-filter-state';
import { Input } from '@/components/ui/input';
import { dayjs } from '@/lib/dayjs';
import { useTable } from '@/lib/hooks/use-table';
import { updateInvitationStatus } from '@/lib/server-actions/invitation';
import { trpc } from '@/lib/trpc/client';
import { INVITATION_STATUS } from '@prisma/client';
import { debounce } from 'lodash';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { getInvitationsColumns } from './invitations-columns';

export const TableUserInvitations = () => {
    const trpcUtils = trpc.useUtils();
    const searchParams = useSearchParams();
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    const [q, setQ] = useState('');
    const [status, setStatus] = useState<INVITATION_STATUS[]>([]);

    console.log('status', status);

    const { data: invitations, refetch } = trpc.invitations.useQuery({ page, limit, status, q, queryColumn: 'ORGANIZATION_NAME' });

    const columns = getInvitationsColumns({
        handleAction: async ({ action, invitationId }) => {
            const res = await updateInvitationStatus({ invitationId, status: action === 'accepted' ? 'ACCEPTED' : 'REJECTED' });

            if (!res.success) {
                toast.error(res.message);
                return;
            }

            toast.success(`invitation ${action}`);
            refetch();
            trpcUtils.organizations.refetch();
        },
        dayjs,
    });

    const { table } = useTable({ columns, data: invitations?.data });

    return (
        <>
            <DataTable
                toolbar={
                    <div className="flex flex-wrap justify-between">
                        <div className="flex items-center gap-4">
                            <Input
                                placeholder="Search"
                                onChange={debounce((event) => setQ(event.target.value), 300)}
                                defaultValue={q || ''}
                                className="min-w-[150px] rounded md:max-w-xs"
                            />

                            <div className="flex items-center gap-2">
                                <MultiOptionsFilterState
                                    options={Object.values(INVITATION_STATUS).map((val) => ({
                                        label: val,
                                        value: val,
                                    }))}
                                    setValues={(val) => setStatus(val as INVITATION_STATUS[])}
                                    values={status}
                                    title="Status"
                                />
                            </div>
                        </div>
                        <DataTableViewOptions table={table} />
                    </div>
                }
                table={table}
                className="my-4"
                totalPages={invitations?.totalPages}
            />
        </>
    );
};
