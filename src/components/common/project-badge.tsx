import { cn } from '@/lib/utils/common';

import { Badge } from '../ui/badge';

type Props = {
    name: string;
    hex: string;
    size?: 'sm' | 'base';
    className?: string;
};

export const ProjectBadge = ({ hex, name, size = 'base', className }: Props) => {
    return (
        <Badge className={cn('text-primary border-ring rounded border bg-transparent text-sm font-normal', size === 'sm' && 'text-xs', className)}>
            <span className="size-2 rounded-full" style={{ backgroundColor: hex }} />
            {name}
        </Badge>
    );
};
