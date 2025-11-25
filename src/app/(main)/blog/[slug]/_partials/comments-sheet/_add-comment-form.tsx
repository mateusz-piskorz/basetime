'use client';
import { CommentForm } from '@/components/common/comment-form';
import { useBlogCommentsSheet } from '@/lib/hooks/use-blog-comments-sheet';
import { createBlogPostComment } from '@/lib/server-actions/blog-post';
import { trpc, TrpcRouterInput, TrpcRouterOutput } from '@/lib/trpc/client';
import { toast } from 'sonner';

type Props = {
    parentComment?: NonNullable<TrpcRouterOutput['blogPostComments']>['data'][number];
    infiniteQueryArgs: TrpcRouterInput['blogPostComments'];
    onCommentAdded?: () => void;
    onCancel?: () => void;
};

export const AddCommentForm = ({ parentComment, infiniteQueryArgs, onCommentAdded, onCancel }: Props) => {
    const { postId, limit, sorting } = useBlogCommentsSheet();
    const trpcUtils = trpc.useUtils();

    return (
        <CommentForm
            className="px-6"
            onCancel={() => onCancel?.()}
            onSubmit={async ({ content }) => {
                const res = await createBlogPostComment({ content, postId, parentId: parentComment?.id });

                if (res.success && res.data) {
                    if (parentComment) {
                        trpcUtils.blogPostComments.refetch({
                            ...infiniteQueryArgs,
                            parentId: parentComment.parentId,
                            sorting: parentComment.parentId ? 'oldest' : sorting,
                        });
                        trpcUtils.blogPostComments.refetch(infiniteQueryArgs);
                    } else {
                        trpcUtils.blogPostComments.cancel(infiniteQueryArgs);
                        trpcUtils.blogPostComments.setInfiniteData(infiniteQueryArgs, (data) => {
                            const commentData = {
                                ...res.data,
                                createdAt: String(res.data.createdAt),
                                updatedAt: String(res.data.updatedAt),
                                upvotedByUser: false,
                                isOwner: true,
                            };
                            if (!data) {
                                return {
                                    pageParams: [1],
                                    pages: [
                                        {
                                            totalPages: 1,
                                            hasMore: false,
                                            total: 1,
                                            limit,
                                            page: 1,
                                            data: [commentData],
                                        },
                                    ],
                                };
                            }

                            return {
                                ...data,
                                pages: data.pages.map((page, index) => {
                                    if (index === 0) {
                                        return { ...page, data: [commentData, ...page.data] };
                                    }
                                    return page;
                                }),
                            };
                        });
                    }

                    toast.success('commented successfully!', { duration: 1500 });

                    onCommentAdded?.();
                } else {
                    toast.error(res.message || 'something went wrong - AddCommentForm');
                }
            }}
        />
    );
};
