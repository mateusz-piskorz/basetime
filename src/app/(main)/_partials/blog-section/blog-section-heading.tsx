import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/common';

type Props = {
    className?: string;
};

export const BlogSectionHeading = ({ className }: Props) => {
    return (
        <div className={cn('max-w-[600px] space-y-4 2xl:max-w-[800px]', className)}>
            <Badge variant="outline">Latest Blog Posts</Badge>
            <h1 className="text-3xl font-semibold xl:text-4xl 2xl:text-6xl">Our Latest Insights</h1>
            <p className="text-muted-foreground 2xl:text-xl">
                Explore our blog for productivity tips, time management strategies, and the latest updates on our time tracker app
            </p>
        </div>
    );
};
