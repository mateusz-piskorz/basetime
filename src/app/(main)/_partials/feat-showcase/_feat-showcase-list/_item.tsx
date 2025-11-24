import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/common';
import { LucideIcon } from 'lucide-react';
import { FC } from 'react';
import './_style.css';

type TextProps = {
    heading: string;
    Icon: LucideIcon;
    description: string;
    badges: string[];
};

const Text = ({ Icon, badges, description, heading }: TextProps) => {
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

type Props = {
    Illustration: FC<{ className?: string }>;
    heading: string;
    Icon: LucideIcon;
    description: string;
    badges: string[];
    className?: string;
};

export const Item = ({ className, badges, description, heading, Icon, Illustration }: Props) => {
    return (
        <div className={cn('bg-background feat-showcase-item-radius space-y-10 rounded-md px-5 py-10 lg:px-8 2xl:px-10', className)}>
            <Card
                className={cn(
                    'h-60 items-center justify-center overflow-hidden bg-transparent shadow-none',
                    'sm:bg-card sm:h-80 sm:px-5',
                    'md:h-96 md:py-10',
                    'lg:h-60 lg:bg-transparent lg:px-0 lg:py-0',
                    'xl:bg-card xl:h-96 xl:px-10 xl:py-10',
                    '2xl:h-[440px] 2xl:py-10',
                )}
            >
                <Illustration className="w-full min-w-[400px]" />
            </Card>

            <Text Icon={Icon} badges={badges} description={description} heading={heading} />
        </div>
    );
};
