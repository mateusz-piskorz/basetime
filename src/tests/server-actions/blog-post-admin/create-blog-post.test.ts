import { prisma } from '@/lib/prisma';
import { createBlogPost } from '@/lib/server-actions/blog-post-admin';
import { mockSession } from '@/tests/utils/mock-session';

const slug = 'new-blog-post';

test('regular user cannot create blog post', async () => {
    mockSession('', { role: 'USER' });

    const result = await createBlogPost({ slug });
    expect(result.success).toBe(false);

    const post = await prisma.blogPost.findUnique({ where: { slug } });
    expect(post).toBe(null);
});

test('admin can create blog post', async () => {
    mockSession('', { role: 'ADMIN' });

    const result = await createBlogPost({ slug });
    expect(result.success).toBe(true);

    const post = await prisma.blogPost.findUnique({ where: { slug } });
    expect(post).not.toBe(null);
});
