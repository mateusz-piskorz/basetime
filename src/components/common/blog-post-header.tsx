import { cn } from '@/lib/utils/common';
import { BlogPost } from '@prisma/client';
import dayjs from 'dayjs';
import { Badge } from '../ui/badge';

type Props = { post: BlogPost; className?: string; hideTagsDesktop?: boolean; large?: boolean };

export const BlogPostHeader = ({ post, className, hideTagsDesktop, large }: Props) => {
    return (
        <header className={cn('space-y-6', className)}>
            <div className={cn('flex flex-wrap gap-4', hideTagsDesktop && 'lg:hidden')}>
                {post.tags.map((tag) => (
                    <Badge variant="outline" key={tag}>
                        {tag}
                    </Badge>
                ))}
            </div>

            <time
                className={cn('text-muted-foreground text-sm 2xl:text-base', large && 'text-base')}
                title="Posted at"
                dateTime={dayjs(post.updatedAt).format('YYYY-MM-DD')}
            >
                {dayjs(post.updatedAt).format('MMMM D, YYYY')}
                {` - ${post.readTime}`}
            </time>

            <h1 className={cn('mt-1 text-xl xl:text-2xl 2xl:text-3xl', large && 'text-3xl sm:text-4xl xl:text-4xl 2xl:text-4xl')}>{post.title}</h1>
        </header>
    );
};
