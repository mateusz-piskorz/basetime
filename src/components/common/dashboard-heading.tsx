import { cn } from '@/lib/utils/common';

type Props = {
    title: string;
    description?: string | React.ReactNode;
    className?: string;
};

export function DashboardHeading({ title, description, className }: Props) {
    return (
        <div className={cn('mb-12 space-y-0.5', className)}>
            <h1 className={cn('text-xl font-semibold sm:text-2xl')}>{title}</h1>
            {description &&
                (typeof description === 'string' ? <p className={cn('text-muted-foreground text-xs sm:text-base')}>{description}</p> : description)}
        </div>
    );
}
