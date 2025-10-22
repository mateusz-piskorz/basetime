'use client';

import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@prisma/client';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { CommentsSheet } from './comments-sheet';

type Props = {
    post: BlogPost;
};

export const ArticleClientWrapper = ({ post }: Props) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <CommentsSheet open={open} setOpen={setOpen} post={post} />

            <div className="my-4 border-y py-4">
                <Button variant="ghost" onClick={() => setOpen(true)}>
                    <MessageCircle /> 23
                </Button>
            </div>

            <MarkdownRenderer content={post.content} />
        </>
    );
};
