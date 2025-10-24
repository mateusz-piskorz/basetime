'use client';

import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import { Button } from '@/components/ui/button';
import { BlogCommentsSheetProvider } from '@/lib/hooks/use-blog-comments-sheet';
import { BlogPost } from '@prisma/client';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { BlogUpvoteButton } from './blog-upvote-button';
import { CommentsSheet } from './comments-sheet';

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
                <BlogUpvoteButton upvotes={post._count.Upvotes} voteType="post" entityId={post.id} />

                <Button variant="ghost" onClick={() => setOpen(true)}>
                    <span className="sr-only">comments</span>
                    <MessageCircle /> {post._count.Comments}
                </Button>
            </div>

            <MarkdownRenderer content={post.content} />
        </>
    );
};
