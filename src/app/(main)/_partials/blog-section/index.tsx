'use server';
import { prisma } from '@/lib/prisma';
import { BlogSectionDesktop } from './_blog-section-desktop';
import { BlogSectionMobile } from './_blog-section-mobile';

export const BlogSection = async () => {
    const posts = await prisma.blogPost.findMany({ take: 5, include: { _count: true } });
    if (posts.length === 0) return <></>;

    return (
        <section className="bg-background py-24 2xl:mx-auto 2xl:max-w-[1920px] 2xl:py-40" id="blog-section">
            <BlogSectionMobile posts={posts} />
            <BlogSectionDesktop posts={posts} />
        </section>
    );
};
