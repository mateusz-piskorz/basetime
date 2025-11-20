import { ProjectBadge } from '@/components/common/project-badge';
import { TaskPriorityBadge } from '@/components/common/task-priority-badge';
import { UserInfo } from '@/components/common/user-info';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import * as KanbanUI from '@/components/ui/kanban';
import { TrpcRouterOutput } from '@/lib/trpc/client';
import { FileClock, GripVertical, MessagesSquare } from 'lucide-react';

type Props = {
    task: NonNullable<TrpcRouterOutput['kanbanColumns']>[number]['Tasks'][number];
    onTaskSelect: (taskId: string) => void;
};

export const KanbanCard = ({ task, onTaskSelect }: Props) => {
    return (
        <div className="relative">
            <KanbanUI.Item key={task.id} value={task.id} asChild>
                <Card variant="outline-light-theme" className="hover:border-accent relative" onClick={() => onTaskSelect(task.id)}>
                    <div className="flex items-center justify-between px-4">
                        <p className="text-base italic">task-{task.taskNumber}</p>
                        <KanbanUI.ItemHandle asChild>
                            <Button variant="ghost" size="icon">
                                <GripVertical className="h-4 w-4" />
                            </Button>
                        </KanbanUI.ItemHandle>
                    </div>

                    <div className="flex flex-col gap-4 px-4">
                        <div className="space-x-5">
                            <TaskPriorityBadge priority={task.priority} />
                            <ProjectBadge hex={task.Project.color} name={task.Project.shortName} />
                        </div>
                        <p className="line-clamp-2 text-base font-bold">{task.name}</p>
                        <div className="flex gap-2">
                            <UserInfo textUnder="Assigned" name={task.Assigned?.User.name ?? 'Unassigned'} avatarId={task.Assigned?.User.avatarId} />
                        </div>
                    </div>

                    <div className="flex gap-6 px-4 font-mono text-sm">
                        <div className="flex items-center gap-1.5">
                            <FileClock className="size-4" />
                            {task._count.TimeEntries}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MessagesSquare className="size-4" />0
                        </div>
                    </div>
                </Card>
            </KanbanUI.Item>
        </div>
    );
};
