'use client';

import { Badge } from '@/components/ui/badge';
import { CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export const BlogHeadingDesktop = () => {
    return (
        <div className="flex w-5/6 items-end justify-between gap-8">
            <div className="max-w-[600px] space-y-4 2xl:max-w-[800px]">
                <Badge variant="outline">Latest Blog Posts</Badge>
                <h1 className="text-3xl font-semibold xl:text-4xl 2xl:text-6xl">Our Latest Insights</h1>
                <p className="text-muted-foreground font-mono 2xl:text-xl">
                    Explore our blog for productivity tips, time management strategies, and the latest updates on our time tracker app
                </p>
            </div>
            <div className="flex gap-4">
                <CarouselPrevious className="static translate-none" variant="ghost" size="icon" />
                <CarouselNext className="static translate-none" variant="ghost" size="icon" />
            </div>
        </div>
    );
};
