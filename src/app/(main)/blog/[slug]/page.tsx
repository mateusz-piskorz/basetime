'use server';

import { Badge } from '@/components/ui/badge';
import { dayjs } from '@/lib/dayjs';
import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import './md.css';

type Params = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function BlogPage({ params }: Params) {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug } });

    if (!post) {
        return notFound();
    }

    return (
        <div className="bg-background mx-auto max-w-[1920px]">
            <article className="mx-auto max-w-5xl px-5 py-24 sm:px-6 md:px-8 lg:py-28 2xl:py-40">
                <span className="text-muted-foreground text-sm 2xl:text-base">
                    <div className="mb-6 flex flex-wrap gap-4">
                        {post.tags.map((tag) => (
                            <Badge variant="outline" key={tag}>
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    {dayjs(post.updatedAt).format('MMMM D, YYYY')}
                    {` - ${post.readTime}`}
                </span>
                <h1 className="mt-1 mb-12 text-3xl sm:text-4xl">{post.title}</h1>
                <div className="markdown-body">
                    <Markdown>{post.content}</Markdown>
                </div>
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
    const posts = await prisma.blogPost.findMany({ select: { slug: true } });

    return posts.map((post) => ({
        slug: post.slug,
    }));
}
