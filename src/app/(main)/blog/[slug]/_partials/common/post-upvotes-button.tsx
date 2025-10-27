'use client';

import { upvoteBlogPost } from '@/lib/server-actions/blog-post';
import { trpc } from '@/lib/trpc/client';
import { useState } from 'react';
import { toast } from 'sonner';
import { UpvotesButton } from './upvotes-button';

type Props = {
    upvotes: number;
    postId: string;
};

export const PostUpvotesButton = ({ upvotes, postId }: Props) => {
    const { data, refetch } = trpc.blogPostUpvote.useQuery({ postId });
    const [loading, setLoading] = useState(false);

    const upvoteHandler = async () => {
        setLoading(true);
        const res = await upvoteBlogPost({ postId });
        if (!res.success) toast.error(res.message || 'something went wrong - PostUpvoteButton');
        else toast.success('upvoted successfully!');
        await refetch();
        setLoading(false);
    };

    return <UpvotesButton active={Boolean(data?.userUpvoted)} disabled={loading} onClick={upvoteHandler} upvotes={upvotes} />;
};
