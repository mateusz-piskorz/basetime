import { initialBlogArticles } from '@/lib/constants/blog-initial-articles';
import { prisma } from '@/lib/prisma';
import { seedBlogPost } from '@/lib/server-actions/blog-post-admin';
import { mockSession } from '@/tests/utils/mock-session';

test('regular user can not seed blog post', async () => {
    mockSession('', { role: 'USER' });

    const result = await seedBlogPost();
    expect(result.success).toBe(false);

    const count = await prisma.blogPost.count();
    expect(count).toBe(0);
});

test('admin can seed blog post', async () => {
    mockSession('', { role: 'ADMIN' });

    const result = await seedBlogPost();
    expect(result.success).toBe(true);

    const count = await prisma.blogPost.count();
    expect(count).toBe(initialBlogArticles.length);
});

test('seedBlogPost can not be used again if database is not empty', async () => {
    mockSession('', { role: 'ADMIN' });

    await seedBlogPost();
    const secondResult = await seedBlogPost();

    expect(secondResult.success).toBe(false);
});
