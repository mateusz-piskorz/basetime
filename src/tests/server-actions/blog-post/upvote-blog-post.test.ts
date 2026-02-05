import { prisma } from '@/lib/prisma';
import { upvoteBlogPost } from '@/lib/server-actions/blog-post';
import { mockSession } from '@/tests/utils/mock-session';

const userId = 'userId2';
const postId = 'blogPostId2';

beforeEach(async () => {
    await prisma.blogPostUpvote.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.create({ data: { id: userId, email: 'user2@test.com', password: '', name: 'User' } });
    await prisma.blogPost.create({ data: { id: postId, title: 'Post', content: '', slug: 's' } });
});

test('unauthenticated user cannot upvote', async () => {
    const result = await upvoteBlogPost({ postId });
    expect(result.success).toBe(false);
    expect(await prisma.blogPostUpvote.count({ where: { postId } })).toBe(0);
});

test('authenticated user can upvote and then remove it (toggle)', async () => {
    mockSession(userId, { role: 'USER' });

    const first = await upvoteBlogPost({ postId });
    expect(first.success).toBe(true);
    expect(await prisma.blogPostUpvote.count({ where: { postId } })).toBe(1);

    mockSession(userId, { role: 'USER' });
    const second = await upvoteBlogPost({ postId });
    expect(second.success).toBe(true);
    expect(await prisma.blogPostUpvote.count({ where: { postId } })).toBe(0);
});
