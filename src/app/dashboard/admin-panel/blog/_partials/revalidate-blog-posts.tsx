'use client';
import React from 'react';

import { Button } from '@/components/ui/button';
import { revalidateBlogPosts } from '@/lib/server-actions/blog-post-admin';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const RevalidateBlogPosts = () => {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);

    const revalidate = async () => {
        setLoading(true);
        const res = await revalidateBlogPosts({});
        if (!res.success) {
            setLoading(false);
            toast.error(res.message || 'something went wrong - revalidateBlogPosts');
            return '';
        }
        toast.success('blog post revalidate completed');
        setLoading(false);
        router.refresh();
    };

    return (
        <Button disabled={loading} onClick={revalidate}>
            revalidate
        </Button>
    );
};
