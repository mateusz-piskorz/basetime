import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { dayjs } from '@/lib/dayjs';
import { cn } from '@/lib/utils/common';
import { BlogPost } from '@prisma/client';
import { ChevronRight, MessageCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

type Props = {
    post: {
        _count: {
            Comments: number;
            Upvotes: number;
        };
    } & BlogPost;
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
                <div className="bg-sidebar flex justify-center lg:w-[60%] lg:justify-start">
                    <img
                        loading="lazy"
                        src={post.ogImageUrl || '/placeholder.png'}
                        alt={post.title}
                        className="h-60 object-cover sm:h-72 lg:h-full dark:opacity-90"
                    />
                </div>

                <div className="flex h-full flex-col items-start gap-4 px-6 py-8 lg:w-[40%] lg:py-6 2xl:p-10">
                    <div className="mb-4 flex flex-wrap gap-4 lg:hidden">
                        {post.tags.map((tag) => (
                            <Badge variant="outline" key={tag}>
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    <time
                        className="text-muted-foreground text-sm 2xl:text-base"
                        title="Posted at"
                        dateTime={dayjs(post.updatedAt).format('YYYY-MM-DD')}
                    >
                        {dayjs(post.updatedAt).format('MMMM D, YYYY')}
                        {` - ${post.readTime}`}
                    </time>

                    <h1 className="text-xl xl:text-2xl 2xl:text-3xl">{post.title}</h1>
                    <p className="text-muted-foreground text-sm 2xl:text-base">{post.description}</p>

                    <div className="relative mt-auto flex items-center gap-4">
                        <span className="flex items-center gap-2">
                            <span className="sr-only">upvotes</span>
                            <Sparkles className="size-3.5" /> {post._count.Upvotes}
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="sr-only">comments</span>
                            <MessageCircle className="size-3.5" /> {post._count.Comments}
                        </span>
                        <Button asChild variant="link" className="pl-0 text-base xl:text-xl">
                            <Link href={`/blog/${post.slug}`}>
                                Read More <ChevronRight />
                            </Link>
                        </Button>
                    </div>
                </div>
            </Card>
        </article>
    );
};
