'use client';

import { Button } from '@/components/ui/button';
import { upvoteBlogPostComment } from '@/lib/server-actions/blog-post';
import { cn } from '@/lib/utils/common';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
    upvotes: number;
    upvoted: boolean;
    commentId: string;
    onUpvote: () => Promise<void>;
};

export const CommentUpvoteButton = ({ upvotes, commentId, upvoted, onUpvote }: Props) => {
    // const trpcUtils = trpc.useUtils();
    const [loading, setLoading] = useState(false);

    const upvoteHandler = async () => {
        setLoading(true);

        const res = await upvoteBlogPostComment({ commentId });

        // await trpcUtils.blogPostComments.refetch({ postId, parentId: commentId, sorting: 'featured' });

        if (!res.success) toast.error(res.message || 'something wen wrong - BlogUpvoteButton');
        else toast.success('upvoted successfully!');
        await onUpvote();
        setLoading(false);
    };

    return (
        <Button variant="ghost" onClick={upvoteHandler} disabled={loading} className={cn(upvoted && 'bg-red-500')}>
            <span className="sr-only">upvotes</span>
            <Sparkles />
            {upvotes}
        </Button>
    );
};
