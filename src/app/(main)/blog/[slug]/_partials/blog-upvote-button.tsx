'use client';

import { Button } from '@/components/ui/button';
import { upvoteBlogPost, upvoteBlogPostComment } from '@/lib/server-actions/blog-post';
import { trpc } from '@/lib/trpc/client';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
    upvotes: number;
    voteType: 'post' | 'comment';
    entityId: string;
};

export const BlogUpvoteButton = ({ upvotes, voteType, entityId }: Props) => {
    const trpcUtils = trpc.useUtils();
    const [loading, setLoading] = useState(false);
    const upvoteHandler = async () => {
        setLoading(true);
        let res;
        if (voteType === 'comment') {
            res = await upvoteBlogPostComment({ commentId: entityId });
            await trpcUtils.blogPostComments.refetch();
        } else {
            res = await upvoteBlogPost({ blogPostId: entityId });
        }
        if (!res.success) toast.error(res.message || 'something wen wrong - BlogUpvoteButton');
        else toast.success('upvoted successfully!');

        setLoading(false);
    };

    return (
        <Button variant="ghost" onClick={upvoteHandler} disabled={loading}>
            <span className="sr-only">upvotes</span>
            <Sparkles />
            {upvotes}
        </Button>
    );
};
