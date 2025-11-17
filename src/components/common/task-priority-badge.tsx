import { TASK_PRIORITY } from '@prisma/client';
import { Badge } from '../ui/badge';

const PRIORITY_COLORS = {
    MINOR: '#388bfd',
    MEDIUM: '#f7c948',
    HIGH: '#ff9800',
    CRITICAL: '#e94545',
};

type Props = {
    priority: TASK_PRIORITY;
};

export const TaskPriorityBadge = ({ priority }: Props) => {
    return (
        <Badge variant="outline" style={{ borderColor: PRIORITY_COLORS[priority], color: PRIORITY_COLORS[priority] }}>
            {priority.toLowerCase()}
        </Badge>
    );
};
