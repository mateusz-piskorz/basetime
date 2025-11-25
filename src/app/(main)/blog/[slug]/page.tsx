'use server';
import { BlogPostHeader } from '@/components/common/blog-post-header';
import { MarkdownRenderer } from '@/components/common/markdown-renderer';
import { BlogCommentsSheetProvider } from '@/lib/hooks/use-blog-comments-sheet';
import { prisma } from '@/lib/prisma';
import { cn } from '@/lib/utils/common';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ActionsSection } from './_partials/actions-section';
import { CommentsSheet } from './_partials/comments-sheet';

type Params = { params: Promise<{ slug: string }> };
export default async function BlogPage({ params }: Params) {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug }, include: { _count: true } });
    if (!post) return notFound();

    return (
        <BlogCommentsSheetProvider postId={post.id}>
            <CommentsSheet post={post} />

            <div
                className={cn(
                    'dark:bg-card my-12 max-w-[1920px] border-t py-12 dark:border-none',
                    'lg:mx-5 lg:my-14 lg:rounded-md lg:border lg:py-14',
                    'xl:mx-20',
                    '2xl:mx-40 2xl:my-20 2xl:py-20',
                )}
            >
                <article className="mx-auto max-w-6xl px-5 sm:px-6 md:px-8 lg:px-10">
                    <BlogPostHeader post={post} className="mb-12" large />
                    <ActionsSection post={post} />
                    <MarkdownRenderer content={post.content} />
                </article>
            </div>
        </BlogCommentsSheetProvider>
    );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { slug } = await params;
    const post = await prisma.blogPost.findUnique({ where: { slug } });

    if (!post) return { title: 'post not found | BaseTime' };

    const title = `${post.title} | BaseTime`;
    return {
        title,
        openGraph: {
            title,
            ...(post.ogImageUrl && { images: [{ url: `${process.env.NEXT_PUBLIC_URL}${post.ogImageUrl}` }] }),
        },
    };
}

export async function generateStaticParams() {
    const posts = await prisma.blogPost.findMany({ select: { slug: true } });
    return posts.map(({ slug }) => ({ slug }));
}
