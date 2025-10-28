'use server';

import { Badge } from '@/components/ui/badge';
import { dayjs } from '@/lib/dayjs';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleClientWrapper } from './_partials';

type Params = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function BlogPage({ params }: Params) {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug }, include: { _count: true } });

    if (!post) {
        return notFound();
    }

    return (
        <div className="dark:bg-card my-12 max-w-[1920px] border-t py-12 lg:mx-5 lg:my-14 lg:rounded-md lg:border lg:py-14 xl:mx-20 2xl:mx-40 2xl:my-20 2xl:py-20 dark:border-none">
            <article className="mx-auto max-w-6xl px-5 sm:px-6 md:px-8 lg:px-10">
                <header>
                    <div className="mb-6 flex flex-wrap gap-4">
                        {post.tags.map((tag) => (
                            <Badge variant="outline" key={tag}>
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <div className="text-muted-foreground flex gap-2">
                        <time title="Posted at" dateTime={dayjs(post.updatedAt).format('YYYY-MM-DD')}>
                            {dayjs(post.updatedAt).format('MMMM D, YYYY')}
                        </time>
                        <p>-</p>
                        <p>{post.readTime}</p>
                    </div>
                    <h1 className="mt-1 mb-12 text-3xl sm:text-4xl">{post.title}</h1>
                </header>

                <ArticleClientWrapper post={post} />
            </article>
        </div>
    );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug } });

    if (!post) {
        return notFound();
    }

    const title = `${post.title} | BaseTime`;

    return {
        title,
        openGraph: {
            title,
            ...(post.ogImageUrl && { images: [{ url: post.ogImageUrl }] }),
        },
    };
}

export async function generateStaticParams() {
    if (process.env.SKIP_GENERATE_STATIC_PARAMS === 'true') return [];
    const posts = await prisma.blogPost.findMany({ select: { slug: true } });

    return posts.map((post) => ({
        slug: post.slug,
    }));
}
