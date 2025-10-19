'use server';

import { BlogPostCard } from '@/components/common/blog-post-card';
import { NotFound } from '@/components/common/not-found';
import { prisma } from '@/lib/prisma';

const BlogPage = async () => {
    const posts = await prisma.blogPost.findMany();
    if (posts.length === 0) return <NotFound title="Nothing here yet" description="try visiting this page later" />;
    return (
        <div className="bg-background px-5 py-24 sm:px-6 md:px-8 lg:px-10 2xl:mx-auto 2xl:max-w-[1920px] 2xl:px-20 2xl:py-40">
            <div className="flex flex-wrap justify-center gap-4 gap-y-20 lg:flex-col">
                {posts.map((post) => (
                    <BlogPostCard className="max-w-[700px]" key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
};

export default BlogPage;
