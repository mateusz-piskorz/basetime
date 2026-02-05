import { prisma } from '@/lib/prisma';
import { upvoteBlogPostComment } from '@/lib/server-actions/blog-post';
import { mockSession } from '@/tests/utils/mock-session';

const userId = 'userId3';
const postId = 'blogPostId3';
const commentId = 'commentId3';

beforeEach(async () => {
    await prisma.blogPostCommentUpvote.deleteMany();
    await prisma.blogPostComment.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.create({ data: { id: userId, email: 'u3@test.com', password: '', name: 'U' } });
    await prisma.blogPost.create({ data: { id: postId, title: 'T', content: '', slug: 's' } });
    await prisma.blogPostComment.create({ data: { id: commentId, content: 'C', authorId: userId, postId } });
});

test('unauthenticated user cannot upvote comment', async () => {
    const result = await upvoteBlogPostComment({ commentId });
    expect(result.success).toBe(false);
});

test('authenticated user can toggle comment upvote', async () => {
    mockSession(userId, { role: 'USER' });

    await upvoteBlogPostComment({ commentId });
    expect(await prisma.blogPostCommentUpvote.count({ where: { commentId } })).toBe(1);

    mockSession(userId, { role: 'USER' });
    await upvoteBlogPostComment({ commentId });
    expect(await prisma.blogPostCommentUpvote.count({ where: { commentId } })).toBe(0);
});
