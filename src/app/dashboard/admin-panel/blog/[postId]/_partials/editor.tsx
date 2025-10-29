'use client';

import { Button } from '@/components/ui/button';
import { updateBlogPost } from '@/lib/server-actions/blog-post-admin';
import { BlogPost } from '@prisma/client';
import MDEditor from '@uiw/react-md-editor';
import { useState } from 'react';
import { toast } from 'sonner';
import { MetadataForm } from './metadata-form';

type Props = {
    post: BlogPost;
};

export const Editor = ({ post }: Props) => {
    const [content, setContent] = useState<string | undefined>(post.content);

    const saveContent = async () => {
        const res = await updateBlogPost({ id: post.id, content, oldSlug: post.slug });

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        toast.success('Post content updated successfully');
    };

    return (
        <div className="space-y-8 px-8">
            <MetadataForm post={post} />

            <MDEditor value={content} onChange={setContent} className="min-h-[700px]" />
            <Button onClick={saveContent}>Save Content</Button>
        </div>
    );
};
