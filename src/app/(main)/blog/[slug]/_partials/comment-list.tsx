import { BlogPostComment } from '@/app/(main)/blog/[slug]/_partials/blog-post-comment';
import { SpinLoader } from '@/components/common/spin-loader';
import { Button } from '@/components/ui/button';
import { trpc, TrpcRouterInput } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';

type Props = {
    blogPostId: string;
    parentId: null | string;
    nestLevel: number;
    sorting: TrpcRouterInput['blogPostComments']['sorting'];
};

export const CommentList = ({ blogPostId, parentId, nestLevel, sorting }: Props) => {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = trpc.blogPostComments.useInfiniteQuery(
        { blogPostId, limit: 30, parentId, sorting },
        { getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined), initialCursor: 1 },
    );
    const results = data?.pages.flatMap((e) => e.data);

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
