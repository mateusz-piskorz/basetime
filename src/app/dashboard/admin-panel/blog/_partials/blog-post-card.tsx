'use client';

import ConfirmDialog from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { removeBlogPost } from '@/lib/server-actions/blog-post-admin';
import { BlogPost } from '@prisma/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
    post: BlogPost;
};

export const BlogPostCard = ({ post }: Props) => {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    return (
        <>
            <ConfirmDialog
                open={open}
                setOpen={setOpen}
                onContinue={async () => {
                    const res = await removeBlogPost({ postId: post.id });
                    if (!res.success) toast.error('something went wrong - removeBlogPost');
                    else toast.success('removed blog post');
                    router.refresh();
                    setOpen(false);
                }}
                title="Are you sure you want to remove blog post"
                description="This action cannot be undone. Blog post will be removed permanently"
            />

            <Card>
                <CardContent className="flex items-center gap-4">
                    {post.slug}
                    <Button asChild>
                        <Link href={`/dashboard/admin-panel/blog/${post.id}`}>Manage</Link>
                    </Button>
                    <Button variant="destructive" onClick={() => setOpen(true)}>
                        Remove
                    </Button>
                </CardContent>
            </Card>
        </>
    );
};
