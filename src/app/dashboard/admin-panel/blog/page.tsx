import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CreateNewPost } from './_partials/create-new-post';

export default async function BlogAdminPanelPage() {
    const user = await getSession();
    if (!user) return redirect('/');
    if (user.role !== 'ADMIN') return redirect('/dashboard');

    const blogPosts = await prisma.blogPost.findMany({});

    return (
        <div className="container mx-auto space-y-8 px-8 py-8">
            <CreateNewPost />

            {blogPosts.length === 0 && <h1>No blog posts yet</h1>}
            <ul>
                {blogPosts.map((post) => (
                    <li key={post.id}>
                        <Card>
                            <CardContent className="flex items-center gap-4">
                                /{post.slug}
                                <Button asChild>
                                    <Link href={`/dashboard/admin-panel/blog/${post.id}`}>Manage</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </li>
                ))}
            </ul>
        </div>
    );
}
