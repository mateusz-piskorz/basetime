import { Button } from '@/components/ui/button';
import { MoveRight } from 'lucide-react';
import { useRef } from 'react';
import { articlesArr } from '../constants';
import { BlogCardMobile } from './blog-card-mobile';
import { BlogHeading } from './blog-heading';

export const BlogSectionMobile = () => {
    const scrollRef = useRef<HTMLDivElement | null>(null);
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
        <section className="bg-background space-y-24 py-24 lg:hidden" id="blog-section">
            <BlogHeading />
            <div className="flex gap-6 overflow-x-auto pb-4 pl-5 sm:pl-6 md:pl-8 lg:hidden" ref={scrollRef}>
                {articlesArr.map((args, index) => (
                    <BlogCardMobile key={index} {...args} />
                ))}
            </div>
            <div className="-mt-24 px-5 text-right sm:px-6 md:px-8 lg:hidden">
                <Button variant="ghost" size="icon" onClick={handleScrollToEnd}>
                    <span className="sr-only">scroll to end</span>
                    <MoveRight />
                </Button>
            </div>
        </section>
    );
};
