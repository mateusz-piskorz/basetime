import { prisma } from '@/lib/prisma';
import { createBlogPostComment, deleteBlogPostComment, upvoteBlogPost, upvoteBlogPostComment } from '@/lib/server-actions/blog-post';
import { mockSession } from '../utils/mock-session';

describe('createBlogPostComment', () => {
    const userId = 'userId1';
    const postId = 'blogPostId1';
    const comment = 'commentId1';
    const deletedComment = 'deletedCommentId1';
    beforeAll(async () => {
        await prisma.user.create({ data: { email: '', password: '', name: '', id: userId } });
        await prisma.blogPost.create({ data: { content: '', slug: '', title: '', id: postId } });
        await prisma.blogPostComment.create({ data: { content: '', id: deletedComment, authorId: userId, postId, deleted: true } });
        await prisma.blogPostComment.create({ data: { content: '', id: comment, authorId: userId, postId } });
    });

    test('unauthenticated user cannot create comment', async () => {
        expect((await createBlogPostComment({ postId, content: 'content' })).success).toBe(false);
        expect((await prisma.blogPostComment.findMany({ where: { postId } })).length).toBe(2);
    });

    test('authenticated user can create comment', async () => {
        mockSession(userId, { role: 'USER' });
        expect((await createBlogPostComment({ postId, content: 'content' })).success).toBe(true);
        expect((await prisma.blogPostComment.findMany({ where: { postId } })).length).toBe(3);
    });

    test('cannot create reply to deleted comment', async () => {
        mockSession(userId, { role: 'USER' });
        expect((await createBlogPostComment({ postId, content: 'content', parentId: deletedComment })).success).toBe(false);
        expect((await prisma.blogPostComment.findMany({ where: { postId } })).length).toBe(3);
    });

    test('can create reply to regular comment', async () => {
        mockSession(userId, { role: 'USER' });
        expect((await createBlogPostComment({ postId, content: 'content', parentId: comment })).success).toBe(true);
        expect((await prisma.blogPostComment.findMany({ where: { postId } })).length).toBe(4);
    });
});

describe('upvoteBlogPost', () => {
    const userId = 'userId2';
    const postId = 'blogPostId2';
    beforeAll(async () => {
        await prisma.blogPost.deleteMany();
        await prisma.user.deleteMany();
        await prisma.user.create({ data: { email: '', password: '', name: '', id: userId } });
        await prisma.blogPost.create({ data: { content: '', slug: '', title: '', id: postId } });
    });

    test('unauthenticated user cannot upvote blog post', async () => {
        expect((await upvoteBlogPost({ postId })).success).toBe(false);
        expect((await prisma.blogPostUpvote.findMany({ where: { postId } })).length).toBe(0);
    });

    test('authenticated user can upvote blog post', async () => {
        mockSession(userId, { role: 'USER' });
        expect((await upvoteBlogPost({ postId })).success).toBe(true);
        expect((await prisma.blogPostUpvote.findMany({ where: { postId } })).length).toBe(1);
    });

    test('authenticated user can remove upvote blog post', async () => {
        mockSession(userId, { role: 'USER' });
        expect((await upvoteBlogPost({ postId })).success).toBe(true);
        expect((await prisma.blogPostUpvote.findMany({ where: { postId } })).length).toBe(0);
    });
});

describe('upvoteBlogPostComment', () => {
    const userId = 'userId3';
    const postId = 'blogPostId3';
    const commentId = 'blogPostCommentId3';
    beforeAll(async () => {
        await prisma.blogPost.deleteMany();
        await prisma.user.deleteMany();
        await prisma.user.create({ data: { email: '', password: '', name: '', id: userId } });
        await prisma.blogPost.create({ data: { content: '', slug: '', title: '', id: postId } });
        await prisma.blogPostComment.create({ data: { content: '', postId, id: commentId, authorId: userId } });
    });

    test('unauthenticated user cannot upvote blog post', async () => {
        expect((await upvoteBlogPostComment({ commentId })).success).toBe(false);
        expect((await prisma.blogPostCommentUpvote.findMany({ where: { commentId } })).length).toBe(0);
    });

    test('authenticated user can upvote blog post', async () => {
        mockSession(userId, { role: 'USER' });
        expect((await upvoteBlogPostComment({ commentId })).success).toBe(true);
        expect((await prisma.blogPostCommentUpvote.findMany({ where: { commentId } })).length).toBe(1);
    });

    test('authenticated user can remove upvote blog post', async () => {
        mockSession(userId, { role: 'USER' });
        expect((await upvoteBlogPostComment({ commentId })).success).toBe(true);
        expect((await prisma.blogPostCommentUpvote.findMany({ where: { commentId } })).length).toBe(0);
    });
});

describe('deleteBlogPostComment', () => {
    const userId1 = 'userId4';
    const userId2 = 'userId5';
    const postId = 'blogPostId4';
    const rootComment1 = {
        id: 'rootComment1',
        reply1: { id: 'reply1', replyNestedLv1: { id: 'replyNestLv1', replyNestedLv2: 'replyNestedLv2' } },
        reply2: 'reply2',
    };
    const rootComment2 = 'rootComment2';

    beforeAll(async () => {
        await prisma.blogPost.deleteMany();
        await prisma.user.deleteMany();
        await prisma.user.create({ data: { email: '1', password: '', name: '', id: userId1 } });
        await prisma.user.create({ data: { email: '2', password: '', name: '', id: userId2 } });
        await prisma.blogPost.create({ data: { content: '', slug: '', title: '', id: postId } });
        await prisma.blogPostComment.create({ data: { content: '', postId, id: rootComment2, authorId: userId2 } });
        await prisma.blogPostComment.create({
            data: {
                content: '',
                postId,
                id: rootComment1.id,
                deleted: true,
                authorId: userId1,
                Replies: {
                    create: {
                        id: rootComment1.reply1.id,
                        content: '',
                        authorId: userId1,
                        deleted: true,
                        postId,
                        Replies: {
                            create: {
                                content: '',
                                authorId: userId1,
                                postId,
                                id: rootComment1.reply1.replyNestedLv1.id,
                                Replies: {
                                    create: { content: '', authorId: userId1, postId, id: rootComment1.reply1.replyNestedLv1.replyNestedLv2 },
                                },
                            },
                        },
                    },
                    createMany: { data: [{ content: '', postId, authorId: userId1, id: rootComment1.reply2 }] },
                },
            },
        });
    });

    test('unauthenticated user cannot delete comment', async () => {
        expect((await deleteBlogPostComment({ commentId: rootComment2 })).success).toBe(false);
        expect((await prisma.blogPostComment.findMany({ where: { postId } })).length).toBe(6);
    });

    test(`authenticated user cannot delete someone's comment`, async () => {
        mockSession(userId1, { role: 'USER' });
        expect((await deleteBlogPostComment({ commentId: rootComment2 })).success).toBe(false);
        expect((await prisma.blogPostComment.findMany({ where: { postId } })).length).toBe(6);
    });

    test('authenticated user can delete comment without replies', async () => {
        mockSession(userId2, { role: 'USER' });
        expect((await deleteBlogPostComment({ commentId: rootComment2 })).success).toBe(true);
        expect((await prisma.blogPostComment.findMany({ where: { postId } })).length).toBe(5);
    });

    test('comment with replies should be soft deleted', async () => {
        mockSession(userId1, { role: 'USER' });
        expect((await deleteBlogPostComment({ commentId: rootComment1.reply1.replyNestedLv1.id })).success).toBe(true);
        expect((await prisma.blogPostComment.findMany({ where: { postId } })).length).toBe(5);
        expect((await prisma.blogPostComment.findUnique({ where: { id: rootComment1.reply1.replyNestedLv1.id } }))?.deleted).toBe(true);
    });

    test('removing reply should also remove all parents marked with delete flag', async () => {
        mockSession(userId1, { role: 'USER' });
        expect((await deleteBlogPostComment({ commentId: rootComment1.reply1.replyNestedLv1.replyNestedLv2 })).success).toBe(true);
        expect((await prisma.blogPostComment.findMany({ where: { postId } })).length).toBe(2);
        expect(await prisma.blogPostComment.findUnique({ where: { id: rootComment1.reply1.replyNestedLv1.replyNestedLv2 } })).toBe(null);
        expect(await prisma.blogPostComment.findUnique({ where: { id: rootComment1.reply1.replyNestedLv1.id } })).toBe(null);
        expect(await prisma.blogPostComment.findUnique({ where: { id: rootComment1.reply1.id } })).toBe(null);
        // should not remove parent comment if it has some replies
        expect(await prisma.blogPostComment.findUnique({ where: { id: rootComment1.id } })).not.toBe(null);
    });
});
