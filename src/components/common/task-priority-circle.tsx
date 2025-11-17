import { TASK_PRIORITY } from '@prisma/client';

const PRIORITY_COLORS = {
    MINOR: '#388bfd',
    MEDIUM: '#f7c948',
    HIGH: '#ff9800',
    CRITICAL: '#e94545',
};

type Props = {
    priority: TASK_PRIORITY;
};

export const TaskPriorityCircle = ({ priority }: Props) => {
    return <span className="h-2 min-w-2 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[priority] }} />;
};
