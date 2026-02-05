import { prisma } from '@/lib/prisma';
import { removeBlogPost } from '@/lib/server-actions/blog-post-admin';
import { mockSession } from '@/tests/utils/mock-session';

const postId = 'remove-test-id';

beforeEach(async () => {
    await prisma.blogPost.create({
        data: { id: postId, slug: 'to-delete', title: '', content: '' },
    });
});

test('regular user can not remove blog post', async () => {
    mockSession('', { role: 'USER' });

    const result = await removeBlogPost({ postId });
    expect(result.success).toBe(false);

    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    expect(post).not.toBe(null);
});

test('admin can remove blog post', async () => {
    mockSession('', { role: 'ADMIN' });

    const result = await removeBlogPost({ postId });
    expect(result.success).toBe(true);

    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    expect(post).toBe(null);
});
