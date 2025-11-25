'use client';
import { UpvotesButton } from '@/components/common/upvotes-button';
import { Button } from '@/components/ui/button';
import { useBlogCommentsSheet } from '@/lib/hooks/use-blog-comments-sheet';
import { upvoteBlogPost } from '@/lib/server-actions/blog-post';
import { trpc } from '@/lib/trpc/client';
import { BlogPost } from '@prisma/client';
import { MessageCircle } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';

type Props = {
    post: {
        _count: {
            Comments: number;
            Upvotes: number;
        };
    } & BlogPost;
};

export const ActionsSection = ({ post }: Props) => {
    const [loading, setLoading] = React.useState(false);
    const { setSheetOpen, postId } = useBlogCommentsSheet();
    const { data, refetch } = trpc.blogPostUpvote.useQuery({ postId });

    const upvoteHandler = async () => {
        setLoading(true);
        const res = await upvoteBlogPost({ postId });
        if (!res.success) toast.error(res.message);
        else toast.success('upvoted successfully!', { duration: 1500 });
        await refetch();
        setLoading(false);
    };

    return (
        <div className="my-4 mb-8 border-y py-4">
            <UpvotesButton active={Boolean(data?.userUpvoted)} disabled={loading} onClick={upvoteHandler} upvotes={post._count.Upvotes} />

            <Button variant="ghost" onClick={() => setSheetOpen(true)}>
                <span className="sr-only">comments</span>
                <MessageCircle /> {post._count.Comments}
            </Button>
        </div>
    );
};
