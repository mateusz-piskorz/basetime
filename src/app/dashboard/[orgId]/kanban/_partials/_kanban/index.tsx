/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import * as KanbanUI from '@/components/ui/kanban';
import { useMember } from '@/lib/hooks/use-member';
import { updateKanbanColumn } from '@/lib/server-actions/kanban-column';
import { moveTaskOnKanban } from '@/lib/server-actions/task';
import { trpc, TrpcRouterOutput } from '@/lib/trpc/client';
import * as React from 'react';
import { toast } from 'sonner';
import { UpsertStatusColumnDialog } from '../common/upsert-status-column-dialog';
import { UpsertTaskDialog } from '../common/upsert-task-dialog';
import { KanbanColumn } from './_kanban-column';

type Task = NonNullable<TrpcRouterOutput['kanbanColumns']>[number]['Tasks'][number];

export function Kanban() {
    const [disabled, setDisabled] = React.useState(false);
    const [selectedColumnId, setSelectedColumnId] = React.useState<string | null>();
    const [selectedTaskId, setSelectedTaskId] = React.useState<string | null>();

    const { orgId } = useMember();
    const { data: columnsData, refetch } = trpc.kanbanColumns.useQuery({ orgId });
    const [columns, setColumns] = React.useState<Record<string, Task[]>>({});

    React.useEffect(() => {
        if (!columnsData) return;

        const newColumns: Record<string, Task[]> = {};

        for (const column of columnsData) {
            const taskMap = new Map<string, Task>();
            for (const t of column.Tasks) taskMap.set(t.id, t);

            const orderedTasks: Task[] = [];
            for (const id of column.TasksOrder) {
                const found = taskMap.get(id);
                if (found) orderedTasks.push(found);
                taskMap.delete(id);
            }

            newColumns[column.id] = [...orderedTasks, ...taskMap.values()];
        }

        setColumns(newColumns);
    }, [columnsData]);

    const selectedColumn = React.useMemo(() => {
        if (!selectedColumnId || !columnsData) return null;
        return columnsData.find((c) => c.id === selectedColumnId);
    }, [selectedColumnId]);

    const selectedTask = React.useMemo(() => {
        if (!selectedTaskId || !columnsData) return null;
        return columnsData.flatMap((e) => e.Tasks).find(({ id }) => id === selectedTaskId);
    }, [selectedTaskId]);

    return (
        <>
            <UpsertStatusColumnDialog
                open={Boolean(selectedColumn)}
                setOpen={(val) => setSelectedColumnId((prev) => (val ? prev : null))}
                selectedColumn={selectedColumn!}
            />

            <UpsertTaskDialog
                open={Boolean(selectedTask)}
                setOpen={(val) => setSelectedTaskId((prev) => (val ? prev : null))}
                selectedTask={selectedTask!}
            />

            <KanbanUI.Root
                value={columns}
                onValueChange={setColumns}
                onMove={async ({ type, overIndex, active, overColumnId, tasksOrder }) => {
                    setDisabled(true);

                    if (type === 'column') {
                        const res = await updateKanbanColumn({ columnId: active.id as string, order: overIndex });
                        if (!res.success) {
                            toast.error(res.message || 'something went wrong');
                            refetch();
                        }
                    } else if (tasksOrder && overColumnId) {
                        const res = await moveTaskOnKanban({
                            tasksOrder,
                            taskId: active.id as string,
                            kanbanColumnId: overColumnId as string,
                        });

                        if (!res.success) {
                            toast.error(res.message || 'something went wrong');
                            refetch();
                        }
                    }
                    setDisabled(false);
                }}
                getItemValue={(item) => item.id}
            >
                <KanbanUI.Board className="flex overflow-auto">
                    {Object.entries(columns).map(([columnId, tasks]) => {
                        const column = columnsData?.find((c) => c.id === columnId);
                        if (!column) return null;

                        return (
                            <KanbanColumn
                                onTaskSelect={setSelectedTaskId}
                                key={columnId}
                                column={column}
                                tasks={tasks}
                                disabled={disabled}
                                onColumnSelect={setSelectedColumnId}
                            />
                        );
                    })}
                </KanbanUI.Board>
                <KanbanUI.Overlay>
                    <div className="bg-primary/10 size-full rounded-md" />
                </KanbanUI.Overlay>
            </KanbanUI.Root>
        </>
    );
}
