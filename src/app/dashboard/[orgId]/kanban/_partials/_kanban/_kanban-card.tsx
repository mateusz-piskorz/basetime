import { Card } from '@/components/ui/card';
import * as KanbanUI from '@/components/ui/kanban';
import { TrpcRouterOutput } from '@/lib/trpc/client';

type Props = {
    task: NonNullable<TrpcRouterOutput['kanbanTasks']>['data'][number];
};

export const KanbanCard = ({ task }: Props) => {
    return (
        <KanbanUI.Item key={task.id} value={task.id} asHandle asChild>
            <Card variant="outline-light-theme">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                        <span className="line-clamp-1 text-sm font-medium">{task.name}</span>
                        {/* <Badge
                            variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                            className="pointer-events-none h-5 rounded-sm px-1.5 text-[11px] capitalize"
                        >
                            {task.priority}
                        </Badge> */}
                    </div>
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                        {task.Assigned && (
                            <div className="flex items-center gap-1">
                                <div className="bg-primary/20 size-2 rounded-full" />
                                <span className="line-clamp-1">{task.Assigned?.User.name}</span>
                            </div>
                        )}
                        {/* {task.dueDate && <time className="text-[10px] tabular-nums">{task.dueDate}</time>} */}
                    </div>
                </div>
            </Card>
        </KanbanUI.Item>
    );
};
