'use client';

import { BlogPostCard } from '@/components/common/blog-post-card';
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { cn } from '@/lib/utils/common';
import { ComponentProps, useEffect, useState } from 'react';
import { BlogSectionHeading } from './blog-section-heading';

type Props = {
    posts: ComponentProps<typeof BlogPostCard>['post'][];
};

export const BlogSectionDesktop = ({ posts }: Props) => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }
        setCurrent(api.selectedScrollSnap());
        api.on('select', () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);

    return (
        <div className="hidden space-y-24 pl-10 lg:block 2xl:pl-20">
            <Carousel setApi={setApi} opts={{ align: 'start' }} className="w-full space-y-12">
                <div className="flex w-5/6 items-end justify-between gap-8">
                    <BlogSectionHeading />
                    <div className="flex gap-4">
                        <CarouselPrevious className="static translate-none" variant="ghost" size="icon" />
                        <CarouselNext className="static translate-none" variant="ghost" size="icon" />
                    </div>
                </div>

                <CarouselContent>
                    {posts.map((post, index) => {
                        const selected = current === index;
                        return (
                            <CarouselItem
                                key={post.id}
                                className={cn(
                                    'flex h-[350px] basis-5/6 gap-6 opacity-50 grayscale-100 xl:h-[400px] 2xl:h-[500px]',
                                    index !== 0 && 'ml-4 xl:ml-6 2xl:ml-8',
                                    selected && 'opacity-100 grayscale-0',
                                )}
                            >
                                <BlogPostCard post={post} />
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
            </Carousel>
        </div>
    );
};
