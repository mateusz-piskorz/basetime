import { SpinLoader } from '@/components/common/spin-loader';
import { Button } from '@/components/ui/button';
import { useBlogCommentsSheet } from '@/lib/hooks/use-blog-comments-sheet';
import { trpc, TrpcRouterInput } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';
import { RefObject } from 'react';
import { Comment } from '.';

type Props = {
    parentId: null | string;
    nestLevel: number;
    sorting: TrpcRouterInput['blogPostComments']['sorting'];
    listRef: RefObject<HTMLUListElement | null>;
};

export const CommentList = ({ parentId, nestLevel, sorting, listRef }: Props) => {
    const { limitQuery, postId } = useBlogCommentsSheet();

    const infiniteQueryArgs = { postId, limit: limitQuery, parentId, sorting };

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = trpc.blogPostComments.useInfiniteQuery(infiniteQueryArgs, {
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
        initialCursor: 1,
    });

    return (
        <ul ref={listRef} className={cn(nestLevel !== 0 && 'ml-2 border-l-2 pl-2')}>
            {data?.pages
                .flatMap((e) => e.data)
                ?.map((comment, index) => (
                    <li key={comment.id} className={cn('px-6', index !== 0 && 'border-t')}>
                        <Comment infiniteQueryArgs={infiniteQueryArgs} nestLevel={nestLevel} comment={comment} />
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
