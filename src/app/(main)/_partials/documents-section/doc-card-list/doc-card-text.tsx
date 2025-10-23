import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

type Props = {
    heading: string;
    Icon: LucideIcon;
    description: string;
    badges: string[];
};

export const DocCardText = ({ Icon, badges, description, heading }: Props) => {
    return (
        <div className="space-y-4 text-center lg:pr-5 lg:text-left 2xl:pr-0">
            <div className="flex items-center justify-center gap-2 lg:justify-start">
                <Icon className="text-accent" />
                <h1 className="text-2xl">{heading}</h1>
            </div>
            <p className="text-muted-foreground text-sm">{description}</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
                {badges.map((badge) => (
                    <Badge variant="secondary" size="small" key={badge}>
                        {badge}
                    </Badge>
                ))}
            </div>
        </div>
    );
};
