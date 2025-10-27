'use client';

import { upvoteBlogPostComment } from '@/lib/server-actions/blog-post';
import { trpc, TrpcRouterInput } from '@/lib/trpc/client';
import { useState } from 'react';
import { toast } from 'sonner';
import { UpvotesButton } from '../../common/upvotes-button';

type Props = {
    upvotes: number;
    upvoted: boolean;
    commentId: string;
    infiniteQueryArgs: TrpcRouterInput['blogPostComments'];
};

export const CommentUpvotesButton = ({ upvotes, commentId, upvoted, infiniteQueryArgs }: Props) => {
    const trpcUtils = trpc.useUtils();
    const [loading, setLoading] = useState(false);

    const upvoteHandler = async () => {
        setLoading(true);

        const res = await upvoteBlogPostComment({ commentId });

        if (res.success) {
            trpcUtils.blogPostComments.cancel(infiniteQueryArgs);
            trpcUtils.blogPostComments.setInfiniteData(infiniteQueryArgs, (data) => {
                if (!data) {
                    return {
                        pageParams: [],
                        pages: [],
                    };
                }

                return {
                    ...data,
                    pages: data.pages.map((page) => ({
                        ...page,
                        data: page.data.map((comment) => {
                            if (comment.id === commentId) {
                                const updatedUpvotesCount = comment._count.Upvotes + (res.upvoteType === 'added' ? 1 : -1);
                                return {
                                    ...comment,
                                    upvotedByUser: res.upvoteType === 'added',
                                    _count: { ...comment._count, Upvotes: updatedUpvotesCount },
                                };
                            } else {
                                return comment;
                            }
                        }),
                    })),
                };
            });
            toast.success('upvoted successfully!');
        } else toast.error(res.message || 'something went wrong - BlogUpvoteButton');

        setLoading(false);
    };

    return <UpvotesButton active={upvoted} disabled={loading} onClick={upvoteHandler} upvotes={upvotes} />;
};
