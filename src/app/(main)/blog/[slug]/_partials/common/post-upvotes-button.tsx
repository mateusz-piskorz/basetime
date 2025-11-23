'use client';
import React from 'react';

import { upvoteBlogPost } from '@/lib/server-actions/blog-post';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';
import { UpvotesButton } from './upvotes-button';

type Props = {
    upvotes: number;
    postId: string;
};

export const PostUpvotesButton = ({ upvotes, postId }: Props) => {
    const { data, refetch } = trpc.blogPostUpvote.useQuery({ postId });
    const [loading, setLoading] = React.useState(false);

    const upvoteHandler = async () => {
        setLoading(true);
        const res = await upvoteBlogPost({ postId });
        if (!res.success) toast.error(res.message || 'something went wrong - PostUpvoteButton');
        else toast.success('upvoted successfully!', { duration: 1500 });
        await refetch();
        setLoading(false);
    };

    return <UpvotesButton active={Boolean(data?.userUpvoted)} disabled={loading} onClick={upvoteHandler} upvotes={upvotes} />;
};
