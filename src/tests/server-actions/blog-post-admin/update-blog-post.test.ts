import { prisma } from '@/lib/prisma';
import { updateBlogPost } from '@/lib/server-actions/blog-post-admin';
import { mockSession } from '@/tests/utils/mock-session';

const blogPostId = 'update-test-id';

beforeEach(async () => {
    await prisma.blogPost.create({
        data: { id: blogPostId, slug: 'old-slug', title: 'old title', content: 'old content' },
    });
});

test('regular user can not update blog post', async () => {
    mockSession('', { role: 'USER' });

    const result = await updateBlogPost({ id: blogPostId, title: 'new title' });
    expect(result.success).toBe(false);

    const post = await prisma.blogPost.findUnique({ where: { id: blogPostId } });
    expect(post?.title).toBe('old title');
});

test('admin can update blog post', async () => {
    mockSession('', { role: 'ADMIN' });

    const result = await updateBlogPost({ id: blogPostId, title: 'new title' });
    expect(result.success).toBe(true);

    const post = await prisma.blogPost.findUnique({ where: { id: blogPostId } });
    expect(post?.title).toBe('new title');
});
