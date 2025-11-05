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
        <div className="space-y-4 text-center lg:text-left">
            <div className="flex items-center justify-center gap-2 lg:justify-start">
                <Icon className="text-accent 2xl:size-7" />
                <h1 className="text-xl font-semibold sm:text-2xl 2xl:text-3xl">{heading}</h1>
            </div>
            <p className="text-muted-foreground text-sm 2xl:text-base">{description}</p>
            <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
                {badges.map((badge) => (
                    <Badge className="dark:bg-secondary 2xl:text-sm dark:border-transparent" variant="outline" size="small" key={badge}>
                        {badge}
                    </Badge>
                ))}
            </div>
        </div>
    );
};
