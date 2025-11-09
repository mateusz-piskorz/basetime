'use client';

import ConfirmDialog from '@/components/common/confirm-dialog';
import { DataTable } from '@/components/common/data-table';
import { DataTableViewOptions } from '@/components/common/data-table/data-table-view-options';
import { MembersFilter } from '@/components/common/members-filter';
import { ProjectsFilter } from '@/components/common/projects-filter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMember } from '@/lib/hooks/use-member';
import { useTable } from '@/lib/hooks/use-table';
import { useTablePagination } from '@/lib/hooks/use-table-pagination';
import { useTableSorting } from '@/lib/hooks/use-table-sorting';
import { deleteTask } from '@/lib/server-actions/task';
import { trpc } from '@/lib/trpc/client';
import { debounce } from 'lodash';
import { useState } from 'react';
import { toast } from 'sonner';
import { getTimeEntryColumns } from './time-entry-columns';
import { UpsertTaskDialog } from './upsert-task-dialog';

export const TableTask = () => {
    const { orgId, member } = useMember();
    // filter
    const [assignedIds, setAssignedIds] = useState<string[]>([]);
    // filter
    const [projects, setProjects] = useState<string[]>([]);
    const { limit, page } = useTablePagination();
    const { order_column, order_direction, sortingProp } = useTableSorting();
    const [q, setQ] = useState('');

    const [open, setOpen] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);

    const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

    const handleDeleteTask = async (taskId: string) => {
        const res = await deleteTask({ taskId });
        if (!res.success) {
            toast.error(res.message);
            return;
        }
        toast.success('Task deleted successfully');
        refetch();
        setOpenConfirm(false);
    };

    const { data: tasks, refetch } = trpc.tasksPaginated.useQuery({
        orgId,
        order_column,
        order_direction,
        page,
        limit,
        assignedIds,
        projects,
        q,
    });

    const { table } = useTable({
        columns: getTimeEntryColumns({
            handleDeleteTask: (taskId: string) => {
                setSelectedId(taskId);
                setOpenConfirm(true);
            },
            handleEditTask: async (taskId: string) => {
                const timeEntry = tasks?.data.find((p) => p.id === taskId);
                if (!timeEntry) return;

                setSelectedId(timeEntry.id);
                setOpen(true);
            },
        }),
        data: tasks?.data,
        sortingProp,
    });

    return (
        <>
            <UpsertTaskDialog open={open} setOpen={setOpen} selectedTask={selectedId ? tasks?.data.find((e) => e.id === selectedId) : undefined} />

            <ConfirmDialog
                open={openConfirm}
                setOpen={setOpenConfirm}
                onContinue={async () => {
                    if (selectedId) await handleDeleteTask(selectedId);
                }}
                title="Are you sure you want to remove this Task"
                description="This action cannot be undone. Task will be permanently deleted"
            />

            <DataTable
                className="border-none shadow-none"
                table={table}
                totalPages={tasks?.totalPages}
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
                                {['MANAGER', 'OWNER'].includes(member.role) && <MembersFilter members={assignedIds} setMembers={setAssignedIds} />}
                            </div>
                            <div className="flex gap-4">
                                <DataTableViewOptions table={table} />
                                <Button
                                    onClick={() => {
                                        setSelectedId(undefined);
                                        setOpen(true);
                                    }}
                                >
                                    Add new Task
                                </Button>
                            </div>
                        </div>
                    </>
                }
            />
        </>
    );
};
