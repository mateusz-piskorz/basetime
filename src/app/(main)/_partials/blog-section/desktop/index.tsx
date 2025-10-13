'use client';

import { Carousel, CarouselApi, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { cn } from '@/lib/utils/common';
import { useEffect, useState } from 'react';
import { articlesArr } from '../constants';
import { BlogCardDesktop } from './blog-card-desktop';
import { BlogHeadingDesktop } from './blog-heading-desktop';

export const BlogSectionDesktop = () => {
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
        <section className="bg-background hidden space-y-24 py-24 pl-10 lg:block 2xl:mx-auto 2xl:max-w-[1920px] 2xl:py-40 2xl:pl-20">
            <Carousel setApi={setApi} opts={{ align: 'start' }} className="w-full space-y-10">
                <BlogHeadingDesktop />

                <CarouselContent>
                    {articlesArr.map((args, index) => {
                        const selected = current === index;
                        return (
                            <CarouselItem
                                key={index}
                                className={cn(
                                    'flex h-[350px] basis-5/6 gap-6 opacity-50 grayscale-100 xl:h-[400px] 2xl:h-[450px]',
                                    index !== 0 && 'pl-4 xl:pl-6 2xl:pl-8',
                                    selected && 'opacity-100 grayscale-0',
                                )}
                            >
                                <BlogCardDesktop className="flex-4/5" variant="full" key={`${index}-full`} {...args} />
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
            </Carousel>
        </section>
    );
};
