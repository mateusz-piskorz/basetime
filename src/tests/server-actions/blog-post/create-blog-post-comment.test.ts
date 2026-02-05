import { prisma } from '@/lib/prisma';
import { createBlogPostComment } from '@/lib/server-actions/blog-post';
import { mockSession } from '@/tests/utils/mock-session';

const userId = 'userId1';
const postId = 'blogPostId1';
const commentId = 'commentId1';
const deletedCommentId = 'deletedCommentId1';

beforeEach(async () => {
    await prisma.user.create({ data: { id: userId, email: 'test@test.com', password: '', name: 'Test User' } });
    await prisma.blogPost.create({ data: { id: postId, title: 'Title', content: 'Content', slug: 'slug' } });

    await prisma.blogPostComment.create({
        data: { id: deletedCommentId, content: 'Deleted', authorId: userId, postId, deleted: true },
    });

    await prisma.blogPostComment.create({
        data: { id: commentId, content: 'Regular', authorId: userId, postId },
    });
});

test('unauthenticated user cannot create comment', async () => {
    const result = await createBlogPostComment({ postId, content: 'content' });
    expect(result.success).toBe(false);
    const count = await prisma.blogPostComment.count({ where: { postId } });
    expect(count).toBe(2);
});

test('authenticated user can create comment', async () => {
    mockSession(userId, { role: 'USER' });
    const result = await createBlogPostComment({ postId, content: 'new comment' });
    expect(result.success).toBe(true);
    const count = await prisma.blogPostComment.count({ where: { postId } });
    expect(count).toBe(3);
});

test('cannot create reply to deleted comment', async () => {
    mockSession(userId, { role: 'USER' });
    const result = await createBlogPostComment({ postId, content: 'reply', parentId: deletedCommentId });
    expect(result.success).toBe(false);
});

test('can create reply to regular comment', async () => {
    mockSession(userId, { role: 'USER' });
    const result = await createBlogPostComment({ postId, content: 'reply', parentId: commentId });
    expect(result.success).toBe(true);
});
