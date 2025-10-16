'use server';

import { prisma } from '@/lib/prisma';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';

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
        <main className="bg-background">
            <article className="mx-auto max-w-3xl px-5 py-24 sm:px-6 md:px-8 lg:py-28 2xl:py-40">
                <Markdown>{post.content}</Markdown>
            </article>
        </main>
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
