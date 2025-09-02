import { projectColor } from '@/lib/constants/project-color';
import { PROJECT_COLOR } from '@prisma/client';
import { Badge } from '../ui/badge';

type Props = {
    name: string;
    color: PROJECT_COLOR;
};

export const ProjectBadge = ({ color, name }: Props) => {
    return (
        <Badge className="text-primary border-ring rounded border-[1px] bg-transparent text-sm font-normal">
            <span className="size-2 rounded-full" style={{ backgroundColor: projectColor[color] }} />
            {name}
        </Badge>
    );
};
