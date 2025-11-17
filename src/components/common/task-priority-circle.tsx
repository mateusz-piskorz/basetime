import { TASK_PRIORITY_COLORS } from '@/lib/constants/task-priority-colors';
import { TASK_PRIORITY } from '@prisma/client';

type Props = {
    priority: TASK_PRIORITY;
};

export const TaskPriorityCircle = ({ priority }: Props) => {
    return <span className="h-2 min-w-2 rounded-full" style={{ backgroundColor: TASK_PRIORITY_COLORS[priority] }} />;
};
