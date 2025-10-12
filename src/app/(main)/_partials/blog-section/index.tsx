'use client';

import { Button } from '@/components/ui/button';
import { MoveRight } from 'lucide-react';
import { BlogCardsList } from './blog-cards-list';
import { BlogHeading } from './blog-heading';

export const BlogSection = () => {
    return (
        <section className="bg-background space-y-24 py-24 2xl:mx-auto 2xl:max-w-[1920px] 2xl:py-40">
            <BlogHeading />
            <BlogCardsList />
            <div className="-mt-24 px-5 text-right sm:px-6 md:px-8 lg:hidden">
                <Button variant="ghost" size="icon">
                    <span className="sr-only">scroll to end</span>
                    <MoveRight />
                </Button>
            </div>
        </section>
    );
};
