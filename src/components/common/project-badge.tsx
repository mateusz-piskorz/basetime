import { projectColor } from '@/lib/constants/project-color';
import { cn } from '@/lib/utils/common';
import { PROJECT_COLOR } from '@prisma/client';
import { Badge } from '../ui/badge';

type Props = {
    name: string;
    color: PROJECT_COLOR;
    size?: 'sm' | 'base';
};

export const ProjectBadge = ({ color, name, size = 'base' }: Props) => {
    return (
        <Badge className={cn('text-primary border-ring rounded border-[1px] bg-transparent text-sm font-normal', size === 'sm' && 'text-xs')}>
            <span className="size-2 rounded-full" style={{ backgroundColor: projectColor[color] }} />
            {name}
        </Badge>
    );
};
