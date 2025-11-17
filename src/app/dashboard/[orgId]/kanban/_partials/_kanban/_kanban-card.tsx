import { TaskPriorityBadge } from '@/components/common/task-priority-badge';
import { UserInfo } from '@/components/common/user-info';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import * as KanbanUI from '@/components/ui/kanban';
import { TrpcRouterOutput } from '@/lib/trpc/client';
import { Eye } from 'lucide-react';

type Props = {
    task: NonNullable<TrpcRouterOutput['kanbanColumns']>[number]['Tasks'][number];
    onTaskSelect: (taskId: string) => void;
};

export const KanbanCard = ({ task, onTaskSelect }: Props) => {
    return (
        <div className="relative">
            <Button className="absolute top-0 right-0 z-10" variant="ghost" onClick={() => onTaskSelect(task.id)}>
                <span className="sr-only">settings</span>
                <Eye />
            </Button>
            <KanbanUI.Item key={task.id} value={task.id} asHandle asChild>
                <Card variant="outline-light-theme" className="relative px-4">
                    <div className="flex flex-col gap-4">
                        <p className="line-clamp-2 text-base font-bold">{task.name}</p>
                        <div className="flex gap-2">
                            <UserInfo textUnder="Assigned" name="Unassigned" />
                        </div>
                        <TaskPriorityBadge priority={task.priority} />
                    </div>
                </Card>
            </KanbanUI.Item>
        </div>
    );
};
