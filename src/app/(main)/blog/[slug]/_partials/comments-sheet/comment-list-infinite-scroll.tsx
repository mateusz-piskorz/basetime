import { SpinLoader } from '@/components/common/spin-loader';
import { useBlogCommentsSheet } from '@/lib/hooks/use-blog-comments-sheet';
import { trpc, TrpcRouterInput } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';
import { useCallback, useRef } from 'react';
import { Comment } from '../common/comment';

type Props = {
    parentId: null | string;
    nestLevel: number;
    sorting: TrpcRouterInput['blogPostComments']['sorting'];
};

export const CommentListInfiniteScroll = ({ parentId, nestLevel, sorting }: Props) => {
    const { limitQuery, postId } = useBlogCommentsSheet();

    const infiniteQueryArgs = { postId, limit: limitQuery, parentId, sorting };
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } = trpc.blogPostComments.useInfiniteQuery(infiniteQueryArgs, {
        getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
        initialCursor: 1,
    });

    const results = data?.pages.flatMap((e) => e.data);

    const intObserver = useRef<IntersectionObserver>(null);
    const lastCommentRef = useCallback(
        (comment: HTMLLIElement | null) => {
            if (isFetchingNextPage) return;

            if (intObserver.current) intObserver.current.disconnect();

            intObserver.current = new IntersectionObserver((posts) => {
                if (posts[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            });

            if (comment) intObserver.current.observe(comment);
        },
        [isFetchingNextPage, fetchNextPage, hasNextPage],
    );

    return (
        <ul className={cn(nestLevel !== 0 && 'ml-2 border-l-2 pl-2')}>
            {results?.map((comment, index) => {
                if (results.length === index + 1) {
                    return (
                        <li key={comment.id} ref={lastCommentRef} className={cn('px-6', index !== 0 && 'border-t')}>
                            <Comment infiniteQueryArgs={infiniteQueryArgs} nestLevel={nestLevel} comment={comment} />
                        </li>
                    );
                }
                return (
                    <li key={comment.id} className={cn('px-6', index !== 0 && 'border-t')}>
                        <Comment infiniteQueryArgs={infiniteQueryArgs} nestLevel={nestLevel} comment={comment} />
                    </li>
                );
            })}
            {(isFetchingNextPage || isPending) && (
                <div className="flex items-center justify-center">
                    <SpinLoader />
                </div>
            )}
        </ul>
    );
};
