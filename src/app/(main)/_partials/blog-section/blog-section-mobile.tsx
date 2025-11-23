'use client';
import React from 'react';

import { BlogPostCard } from '@/components/common/blog-post-card';
import { Button } from '@/components/ui/button';
import { MoveRight } from 'lucide-react';
import { ComponentProps } from 'react';
import { BlogSectionHeading } from './blog-section-heading';

type Props = {
    posts: ComponentProps<typeof BlogPostCard>['post'][];
};

export const BlogSectionMobile = ({ posts }: Props) => {
    const scrollRef = React.useRef<HTMLDivElement | null>(null);
    const handleScrollToEnd = () => {
        const node = scrollRef.current;
        if (node) {
            node.scrollTo({
                left: node.scrollWidth,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="lg:hidden">
            <BlogSectionHeading className="mb-12 px-5 sm:px-6 md:px-8" />

            <div className="flex gap-6 overflow-x-auto px-5 pb-4 sm:px-6 md:px-8" ref={scrollRef}>
                {posts.map((post, index) => (
                    <BlogPostCard key={index} post={post} className="min-w-[400px]" />
                ))}
            </div>

            <div className="px-5 text-right sm:px-6 md:px-8">
                <Button variant="ghost" size="icon" onClick={handleScrollToEnd}>
                    <span className="sr-only">scroll to end</span>
                    <MoveRight />
                </Button>
            </div>
        </div>
    );
};
