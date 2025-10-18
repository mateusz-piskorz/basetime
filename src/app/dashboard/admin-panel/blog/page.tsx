import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { BlogPostCard } from './_partials/blog-post-card';
import { CreateNewPost } from './_partials/create-new-post';
import { SeedPosts } from './_partials/seed-blog-posts';

export default async function BlogAdminPanelPage() {
    const user = await getSession();
    if (!user) return redirect('/');
    if (user.role !== 'ADMIN') return redirect('/dashboard');

    const blogPosts = await prisma.blogPost.findMany({});

    return (
        <div className="container mx-auto space-y-8 px-8 py-8">
            <div className="space-x-8">
                <SeedPosts />
                <CreateNewPost />
            </div>

            {blogPosts.length === 0 && <h1>No blog posts yet</h1>}
            <ul className="space-y-8">
                {blogPosts.map((post) => (
                    <li key={post.id}>
                        <BlogPostCard post={post} />
                    </li>
                ))}
            </ul>
        </div>
    );
}
