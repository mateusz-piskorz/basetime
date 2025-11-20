import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import * as KanbanUI from '@/components/ui/kanban';
import { TrpcRouterOutput } from '@/lib/trpc/client';
import { GripVertical, Settings } from 'lucide-react';
import { KanbanCard } from './_kanban-card';

type Props = {
    column: NonNullable<TrpcRouterOutput['kanbanColumns']>[number];
    tasks: NonNullable<TrpcRouterOutput['kanbanColumns']>[number]['Tasks'];
    disabled: boolean;
    onColumnSelect: (columnId: string) => void;
    onTaskSelect: React.ComponentProps<typeof KanbanCard>['onTaskSelect'];
};

export const KanbanColumn = ({ column, tasks, disabled, onColumnSelect, onTaskSelect }: Props) => {
    return (
        <KanbanUI.Column value={column.id} disabled={disabled} className="dark:bg-card min-w-[350px] bg-transparent dark:border-none">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="size-4 rounded-full" style={{ backgroundColor: column.color }} />
                    <span className="text-sm font-semibold">{column.name}</span>
                    <Badge variant="secondary" className="pointer-events-none rounded-sm">
                        {tasks.length}
                    </Badge>
                </div>
                <div>
                    <Button className="relative" variant="ghost" onClick={() => onColumnSelect(column.id)}>
                        <span className="sr-only">update column</span>
                        <Settings />
                    </Button>
                    <KanbanUI.ColumnHandle asChild>
                        <Button variant="ghost" size="icon">
                            <GripVertical className="h-4 w-4" />
                        </Button>
                    </KanbanUI.ColumnHandle>
                </div>
            </div>
            <div className="flex flex-col gap-2 p-0.5">
                {tasks.map((task) => (
                    <KanbanCard key={task.id} task={task} onTaskSelect={onTaskSelect} />
                ))}
            </div>
        </KanbanUI.Column>
    );
};
