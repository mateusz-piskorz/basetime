/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import ConfirmDialog from '@/components/common/confirm-dialog';
import { DataTable } from '@/components/common/data-table-new';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { projectColor } from '@/lib/constants/project-color';
import { useDayjs } from '@/lib/hooks/use-dayjs';
import { useMember } from '@/lib/hooks/use-member';
import { useTable } from '@/lib/hooks/use-table';
import { removeTimeEntries } from '@/lib/server-actions/time-entry';
import { trpc } from '@/lib/trpc/client';
import { SortingState } from '@tanstack/react-table';
import { debounce } from 'lodash';
import { Trash2, User2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { DataTableViewOptions } from '../data-table/data-table-view-options';
import { ManualTimeEntryDialog } from '../manual-time-entry-dialog';
import { MultiOptionsFilterState } from '../multi-options-filter-state';
import { getTimeEntryColumns } from './time-entry-columns';

export const TableTimeEntry = () => {
    const { dayjs } = useDayjs();
    const { organizationId, member } = useMember();
    const [members, setMembers] = useState<string[]>([]);
    const [projects, setProjects] = useState<string[]>([]);

    const { data: membersData } = trpc.getMembers.useQuery({ organizationId });
    const { data: projectsData } = trpc.getProjects.useQuery({ organizationId, onlyManageable: true });

    const searchParams = useSearchParams();
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    const [open, setOpen] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openConfirmMulti, setOpenConfirmMulti] = useState(false);

    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

    const [selectedIds, setSelectedIds] = useState<string[] | undefined>(undefined);

    const [q, setQ] = useState('');

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

    const [sorting, setSorting] = useState<SortingState>([]);

    const { data: timeEntries, refetch } = trpc.getTimeEntriesPaginated.useQuery({
        organizationId,
        order_column: sorting?.[0]?.id,
        order_direction: sorting?.[0]?.desc ? 'desc' : 'asc',
        page,
        limit,
        memberIds: members,
        projectIds: projects,
        q,
    });

    const columns = getTimeEntryColumns({
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
    });

    const { table } = useTable({ columns, data: timeEntries?.data, sorting, setSorting });

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
                toolbar={
                    <>
                        <div className="flex flex-wrap justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Input
                                    placeholder="Search"
                                    onChange={debounce((event) => setQ(event.target.value), 300)}
                                    defaultValue={q || ''}
                                    className="min-w-[150px] rounded md:max-w-xs"
                                />

                                <div className="flex items-center gap-2">
                                    <MultiOptionsFilterState
                                        options={(projectsData || []).map(({ id, name, color }) => ({
                                            label: (
                                                <>
                                                    <span
                                                        className="mr-2 inline-block h-2 w-2 rounded-full"
                                                        style={{ backgroundColor: projectColor[color] }}
                                                    />
                                                    {name}
                                                </>
                                            ),
                                            value: id,
                                        }))}
                                        setValues={(val) => setProjects(val)}
                                        values={projects}
                                        title="Projects"
                                    />
                                    {['MANAGER', 'OWNER'].includes(member.role) && (
                                        <MultiOptionsFilterState
                                            options={(membersData || []).map(({ User, id }) => ({
                                                label: `${User.name} ${member.id === id ? '(You)' : ''}`,
                                                value: id,
                                                icon: User2,
                                            }))}
                                            setValues={(val) => setMembers(val)}
                                            values={members}
                                            title="Members"
                                        />
                                    )}
                                </div>
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
                table={table}
                totalPages={timeEntries?.totalPages}
            />
        </>
    );
};
