'use client';

import * as KanbanUI from '@/components/ui/kanban';
import { useMember } from '@/lib/hooks/use-member';
import { updateKanbanColumn } from '@/lib/server-actions/kanban-column';
import { trpc, TrpcRouterOutput } from '@/lib/trpc/client';
import * as React from 'react';
import { toast } from 'sonner';
import { UpsertColumnDialog } from '../common/upsert-column-dialog';
import { KanbanColumn } from './_kanban-column';

type Task = NonNullable<TrpcRouterOutput['kanbanColumns']>[number]['Tasks'][number];

export function Kanban() {
    const [disabled, setDisabled] = React.useState(false);
    const [selectedColumnId, setSelectedColumnId] = React.useState<string | null>();

    const { orgId } = useMember();
    const { data: columnsData, refetch } = trpc.kanbanColumns.useQuery({ orgId });
    const [columns, setColumns] = React.useState<Record<string, Task[]>>({});

    React.useEffect(() => {
        if (!columnsData) return;
        const newColumns: Record<string, Task[]> = {};
        for (const d of columnsData) newColumns[d.id] = d.Tasks;
        setColumns(newColumns);
    }, [columnsData]);

    const selectedColumn = React.useMemo(() => {
        if (!selectedColumnId || !columnsData) return null;
        return columnsData.find((c) => c.id === selectedColumnId);
    }, [selectedColumnId]);

    return (
        <>
            <UpsertColumnDialog
                open={Boolean(selectedColumn)}
                setOpen={(val) => setSelectedColumnId((prev) => (val ? prev : null))}
                selectedColumn={selectedColumn!}
            />

            <KanbanUI.Root
                value={columns}
                onValueChange={setColumns}
                onMove={async ({ type, overIndex, active }) => {
                    if (type === 'column') {
                        setDisabled(true);
                        const res = await updateKanbanColumn({ columnId: active.id as string, order: overIndex });
                        if (!res.success) {
                            toast.error(res.message || 'something went wrong');
                            refetch();
                        }
                        setDisabled(false);
                    } else {
                        // here update task
                    }
                }}
                getItemValue={(item) => item.id}
            >
                <KanbanUI.Board className="grid auto-rows-fr sm:grid-cols-3">
                    {Object.entries(columns).map(([columnId, tasks]) => {
                        const column = columnsData?.find((c) => c.id === columnId);
                        if (!column) return null;

                        return <KanbanColumn key={columnId} column={column} tasks={tasks} disabled={disabled} onColumnSelect={setSelectedColumnId} />;
                    })}
                </KanbanUI.Board>
                <KanbanUI.Overlay>
                    <div className="bg-primary/10 size-full rounded-md" />
                </KanbanUI.Overlay>
            </KanbanUI.Root>
        </>
    );
}
