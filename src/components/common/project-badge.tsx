import { cn } from '@/lib/utils/common';

import { Badge } from '../ui/badge';

type Props = {
    name: string;
    hex: string;
    size?: 'sm' | 'base';
};

export const ProjectBadge = ({ hex, name, size = 'base' }: Props) => {
    return (
        <Badge variant="outline" className={cn('max-w-[150px]', size === 'sm' && 'text-xs')} style={{ borderColor: hex, color: hex }}>
            <span className="truncate">{name}</span>
        </Badge>
    );
};
