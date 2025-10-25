'use client';

import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import { Button } from '@/components/ui/button';
import { BlogCommentsSheetProvider } from '@/lib/hooks/use-blog-comments-sheet';
import { BlogPost } from '@prisma/client';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { CommentsSheet } from './comments-sheet';
import { PostUpvoteButton } from './post-upvote-button';

type Props = {
    post: {
        _count: {
            Comments: number;
            Upvotes: number;
        };
    } & BlogPost;
};

export const ArticleClientWrapper = ({ post }: Props) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <BlogCommentsSheetProvider>
                <CommentsSheet open={open} setOpen={setOpen} post={post} />
            </BlogCommentsSheetProvider>

            <div className="my-4 mb-8 border-y py-4">
                <PostUpvoteButton postId={post.id} upvotes={post._count.Upvotes} />

                <Button variant="ghost" onClick={() => setOpen(true)}>
                    <span className="sr-only">comments</span>
                    <MessageCircle /> {post._count.Comments}
                </Button>
            </div>

            <MarkdownRenderer content={post.content} />
        </>
    );
};
