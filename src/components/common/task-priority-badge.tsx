import { TASK_PRIORITY_COLORS } from '@/lib/constants/task-priority-colors';
import { TASK_PRIORITY } from '@prisma/client';
import { Badge } from '../ui/badge';

type Props = {
    priority: TASK_PRIORITY;
};

export const TaskPriorityBadge = ({ priority }: Props) => {
    return (
        <Badge variant="outline" style={{ borderColor: TASK_PRIORITY_COLORS[priority], color: TASK_PRIORITY_COLORS[priority] }}>
            {priority.toLowerCase()}
        </Badge>
    );
};
