import { cn } from '@/lib/utils';

type Props = {
    title: string;
    description?: string | React.ReactNode;
    className?: string;
};

export function DashboardHeading({ title, description, className }: Props) {
    return (
        <div className={cn('mb-5 space-y-0.5', className)}>
            <h1 className={cn('text-xl font-semibold')}>{title}</h1>
            {description && (typeof description === 'string' ? <p className={cn('text-muted-foreground text-sm')}>{description}</p> : description)}
        </div>
    );
}
