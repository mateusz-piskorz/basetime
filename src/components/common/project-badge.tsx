import { cn } from '@/lib/utils/common';

import { Badge } from '../ui/badge';

type Props = {
    name: string;
    hex: string;
    size?: 'sm' | 'base';
};

export const ProjectBadge = ({ hex, name, size = 'base' }: Props) => {
    return (
        <Badge className={cn('text-primary border-ring rounded border bg-transparent text-sm font-normal', size === 'sm' && 'text-xs')}>
            <span className="size-2 rounded-full" style={{ backgroundColor: hex }} />
            {name}
        </Badge>
    );
};
