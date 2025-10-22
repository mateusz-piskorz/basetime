'use client';

import { Button } from '@/components/ui/button';
import { seedBlogPostComments } from '@/lib/server-actions/blog-post-admin';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
    blogPostId: string;
};

export const SeedBlogPostComments = ({ blogPostId }: Props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const seed = async () => {
        setLoading(true);
        const res = await seedBlogPostComments({ blogPostId });
        if (!res.success) {
            setLoading(false);
            toast.error(res.message || 'something went wrong - seedBlogPostComments');
            return '';
        }
        toast.success('blog post comments seeding completed');
        setLoading(false);
        router.refresh();
    };

    return (
        <Button disabled={loading} onClick={seed}>
            Add random ~100 comments
        </Button>
    );
};
