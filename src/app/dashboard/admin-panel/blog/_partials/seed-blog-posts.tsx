'use client';

import { Button } from '@/components/ui/button';
import { seedBlogPost } from '@/lib/server-actions/blog-post-admin';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export const SeedPosts = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const seed = async () => {
        setLoading(true);
        const res = await seedBlogPost();
        if (!res.success) {
            setLoading(false);
            toast.error(res.message || 'something went wrong - seedPost');
            return '';
        }
        toast.success('blog post seeding completed');
        setLoading(false);
        router.refresh();
    };

    return (
        <Button disabled={loading} onClick={seed}>
            Seed
        </Button>
    );
};
