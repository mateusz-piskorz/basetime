/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { ManualTimeEntryDialog } from '@/app/dashboard/[organizationId]/time/_partials/manual-time-entry-dialog';
import ConfirmDialog from '@/components/common/confirm-dialog';
import { DataTable } from '@/components/common/data-table';
import { DataTableViewOptions } from '@/components/common/data-table/data-table-view-options';
import { MembersFilter } from '@/components/common/members-filter';
import { ProjectsFilter } from '@/components/common/projects-filter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDayjs } from '@/lib/hooks/use-dayjs';
import { useMember } from '@/lib/hooks/use-member';
import { useTable } from '@/lib/hooks/use-table';
import { useTablePagination } from '@/lib/hooks/use-table-pagination';
import { useTableSorting } from '@/lib/hooks/use-table-sorting';
import { removeTimeEntries } from '@/lib/server-actions/time-entry';
import { trpc } from '@/lib/trpc/client';
import { debounce } from 'lodash';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { getTimeEntryColumns } from './time-entry-columns';

export const TableTimeEntry = () => {
    const { dayjs } = useDayjs();
    const { organizationId, member } = useMember();
    const [members, setMembers] = useState<string[]>([]);
    const [projects, setProjects] = useState<string[]>([]);
    const { limit, page } = useTablePagination();
    const { order_column, order_direction, sortingProp } = useTableSorting();
    const [q, setQ] = useState('');

    const [open, setOpen] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openConfirmMulti, setOpenConfirmMulti] = useState(false);

    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
    const [selectedIds, setSelectedIds] = useState<string[] | undefined>(undefined);

    const handleDeleteTimeEntries = async (timeEntryIds: string[]) => {
        const res = await removeTimeEntries({ timeEntryIds });
        if (!res.success) {
            toast.error(res.message);
            return;
        }
        toast.success('TimeEntry deleted successfully');
        refetch();
        setOpenConfirm(false);
        setOpenConfirmMulti(false);
    };

    const { data: timeEntries, refetch } = trpc.timeEntriesPaginated.useQuery({
        organizationId,
        order_column,
        order_direction,
        page,
        limit,
        members,
        projects,
        q,
    });

    const { table } = useTable({
        columns: getTimeEntryColumns({
            handleDeleteTimeEntry: (timeEntryId: string) => {
                setSelectedId(timeEntryId);
                setOpenConfirm(true);
            },
            handleEditTimeEntry: async (timeEntryId: string) => {
                const timeEntry = timeEntries?.data.find((p) => p.id === timeEntryId);
                if (!timeEntry) return;

                setSelectedId(timeEntry.id);
                setOpen(true);
            },
            dayjs,
        }),
        data: timeEntries?.data,
        sortingProp,
    });

    const selected = table.getFilteredSelectedRowModel().rows;

    return (
        <>
            <ManualTimeEntryDialog
                open={open}
                setOpen={setOpen}
                selectedTimeEntry={selectedId ? timeEntries?.data.find((e) => e.id === selectedId) : undefined}
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
                table={table}
                totalPages={timeEntries?.totalPages}
                toolbar={
                    <>
                        <div className="flex flex-wrap justify-between gap-4">
                            <div className="flex gap-4">
                                <Input
                                    placeholder="Search"
                                    onChange={debounce((event) => setQ(event.target.value), 300)}
                                    defaultValue={q || ''}
                                    className="min-w-[150px] rounded md:max-w-xs"
                                />

                                <ProjectsFilter projects={projects} setProjects={setProjects} />
                                {['MANAGER', 'OWNER'].includes(member.role) && <MembersFilter members={members} setMembers={setMembers} />}
                            </div>
                            <div className="flex gap-4">
                                <DataTableViewOptions table={table} />
                                <Button
                                    onClick={() => {
                                        setSelectedId(undefined);
                                        setOpen(true);
                                    }}
                                >
                                    Add new timeEntry
                                </Button>
                            </div>
                        </div>
                        {selected.length > 0 && (
                            <div className="text-muted-foreground flex items-center gap-2 text-sm">
                                <p className="whitespace-nowrap">{selected.length} selected</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedIds(selected.map((e) => (e.original as any).id));
                                        setOpenConfirmMulti(true);
                                    }}
                                >
                                    <Trash2 color="red" />
                                </Button>
                            </div>
                        )}
                    </>
                }
            />
        </>
    );
};
