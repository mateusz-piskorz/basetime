'use client';

import { Badge } from '@/components/ui/badge';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export const BlogHeading = () => {
    return (
        <div className="flex items-end justify-between gap-8 px-5 sm:px-6 md:px-8 lg:px-10 2xl:px-20">
            <div className="max-w-[600px] space-y-4 2xl:max-w-[800px]">
                <Badge variant="outline">Latest Blog Posts</Badge>
                <h1 className="text-3xl font-semibold xl:text-4xl 2xl:text-6xl">Our Latest Insights</h1>
                <p className="text-muted-foreground font-mono 2xl:text-xl">
                    Explore our blog for productivity tips, time management strategies, and the latest updates on our time tracker app
                </p>
            </div>
            <Link href="#" className="hidden gap-2 whitespace-nowrap lg:flex">
                Learn more <ArrowUpRight />
            </Link>
        </div>
    );
};
