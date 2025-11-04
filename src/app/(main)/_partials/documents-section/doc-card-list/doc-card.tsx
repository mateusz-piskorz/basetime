import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/common';
import { LucideIcon } from 'lucide-react';
import { FC } from 'react';
import { DocCardText } from './doc-card-text';
import './doc-card.css';

type Props = {
    Illustration: FC<{ className?: string }>;
    heading: string;
    Icon: LucideIcon;
    description: string;
    badges: string[];
    className?: string;
};

export const DocCard = ({ className, badges, description, heading, Icon, Illustration }: Props) => {
    return (
        <div className={cn('bg-background custom-doc-card-radius space-y-10 rounded-md px-5 py-10 lg:px-8 2xl:px-10', className)}>
            <Card
                className={cn(
                    'h-60 items-center justify-center overflow-hidden bg-transparent shadow-none',
                    'sm:bg-card sm:h-80 sm:px-5',
                    'md:h-96 md:py-10',
                    'lg:h-60 lg:bg-transparent lg:px-0 lg:py-0',
                    'xl:bg-card xl:h-96 xl:px-10 xl:py-10',
                    '2xl:h-[480px] 2xl:py-16',
                )}
            >
                <Illustration className="w-full min-w-[400px]" />
            </Card>

            <DocCardText Icon={Icon} badges={badges} description={description} heading={heading} />
        </div>
    );
};
