import { BlogPostComment } from '@/components/common/blog-post-comment';
import { SpinLoader } from '@/components/common/spin-loader';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';

type Props = {
    blogPostId: string;
    parentId: null | string;
    nestLevel: number;
    sorting: 'featured' | 'latest' | 'oldest';
};

export const CommentListCollapsible = ({ blogPostId, parentId, nestLevel, sorting }: Props) => {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = trpc.blogPostComments.useInfiniteQuery(
        { blogPostId, limit: 20, parentId, sorting },
        { getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined), initialCursor: 1 },
    );
    const results = data?.pages.flatMap((e) => e.data);
    console.log({ results });

    return (
        <ul className={cn(nestLevel !== 0 && 'ml-2 border-l-2 pl-2')}>
            {results?.map((comment, index) => (
                <li key={comment.id} className={cn('px-6', index !== 0 && 'border-t-[1px]')}>
                    <BlogPostComment nestLevel={nestLevel} comment={comment} />
                </li>
            ))}
            {(isFetchingNextPage || isPending) && (
                <div className="flex items-center justify-center">
                    <SpinLoader />
                </div>
            )}
            {hasNextPage && !isFetchingNextPage && !isPending && <Button onClick={() => fetchNextPage()}>fetchNextPage</Button>}
        </ul>
    );
};
