import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { dayjs } from '@/lib/dayjs';
import { cn } from '@/lib/utils/common';
import { BlogPost } from '@prisma/client';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';

type Props = {
    post: BlogPost;
    className?: string;
};

export const BlogPostCard = ({ post, className }: Props) => {
    return (
        <article>
            <Card
                className={cn(
                    'h-full w-full max-w-[400px] gap-0 overflow-hidden rounded-md py-0 lg:h-[350px] lg:max-w-full lg:flex-row xl:h-[400px] 2xl:h-[450px]',
                    className,
                )}
            >
                <Image
                    src={post.ogImageUrl || '/placeholder.png'}
                    width={1024}
                    height={450}
                    alt={post.title}
                    className="h-[240px] object-cover grayscale-25 lg:h-full lg:w-[60%] dark:opacity-90"
                />

                <div className="flex h-full flex-col items-start gap-4 px-6 py-8 lg:w-[40%] lg:py-6 2xl:p-10">
                    <div className="mb-4 flex flex-wrap gap-4 lg:hidden">
                        {post.tags.map((tag) => (
                            <Badge variant="outline" key={tag}>
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <span className="text-muted-foreground text-sm 2xl:text-base">
                        {dayjs(post.updatedAt).format('MMMM D, YYYY')}
                        {` - ${post.readTime}`}
                    </span>
                    <h1 className="text-xl xl:text-2xl 2xl:text-3xl">{post.title}</h1>
                    <p className="text-muted-foreground font-mono text-sm 2xl:text-base">{post.description}</p>
                    <Button asChild variant="link" className="mt-auto pb-0 pl-0 text-base xl:text-xl">
                        <Link href={`/blog/${post.slug}`}>
                            Read More <ChevronRight />
                        </Link>
                    </Button>
                </div>
            </Card>
        </article>
    );
};
