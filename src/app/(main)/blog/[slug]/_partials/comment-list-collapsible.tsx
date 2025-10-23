import { BlogPostComment } from '@/components/common/blog-post-comment';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';

type Props = {
    blogPostId: string;
    parentId: null | string;
    nestLevel: number;
};

export const CommentListCollapsible = ({ blogPostId, parentId, nestLevel }: Props) => {
    const { data } = trpc.blogPostComments.useQuery({ blogPostId, limit: 50, parentId });
    return (
        <ul className={cn(nestLevel !== 0 && 'ml-2 border-l-2 pl-2')}>
            {data?.data.map((comment, index) => (
                <li key={comment.id} className={cn('px-6', index !== 0 && 'border-t-[1px]')}>
                    <BlogPostComment nestLevel={nestLevel} comment={comment} />
                </li>
            ))}
        </ul>
    );
};
