import { prisma } from '@/lib/prisma';
import { createBlogPostComment, upvoteBlogPost, upvoteBlogPostComment } from '@/lib/server-actions/blog-post';
import { mockSession } from '../utils/mock-session';

describe('createBlogPostComment', () => {
    const userId = 'userId1';
    const postId = 'blogPostId1';
    beforeAll(async () => {
        await prisma.user.create({ data: { email: '', password: '', name: '', id: userId } });
        await prisma.blogPost.create({ data: { content: '', slug: '', title: '', id: postId } });
    });

    test('unAuthenticated user cannot create comment', async () => {
        expect((await createBlogPostComment({ postId, content: 'content' })).success).toBe(false);
        expect((await prisma.blogPostComment.findMany({ where: { postId } })).length).toBe(0);
    });

    test('authenticated user can create comment', async () => {
        mockSession(userId, 'USER');
        expect((await createBlogPostComment({ postId, content: 'content' })).success).toBe(true);
        expect((await prisma.blogPostComment.findMany({ where: { postId } })).length).toBe(1);
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

    test('unAuthenticated user cannot upvote blog post', async () => {
        expect((await upvoteBlogPost({ postId })).success).toBe(false);
        expect((await prisma.blogPostUpvote.findMany({ where: { postId } })).length).toBe(0);
    });

    test('authenticated user can upvote blog post', async () => {
        mockSession(userId, 'USER');
        expect((await upvoteBlogPost({ postId })).success).toBe(true);
        expect((await prisma.blogPostUpvote.findMany({ where: { postId } })).length).toBe(1);
    });

    test('authenticated user can remove upvote blog post', async () => {
        mockSession(userId, 'USER');
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
        await prisma.blogPostComment.create({ data: { content: '', postId, id: commentId, userId } });
    });

    test('unAuthenticated user cannot upvote blog post', async () => {
        expect((await upvoteBlogPostComment({ commentId })).success).toBe(false);
        expect((await prisma.blogPostCommentUpvote.findMany({ where: { commentId } })).length).toBe(0);
    });

    test('authenticated user can upvote blog post', async () => {
        mockSession(userId, 'USER');
        expect((await upvoteBlogPostComment({ commentId })).success).toBe(true);
        expect((await prisma.blogPostCommentUpvote.findMany({ where: { commentId } })).length).toBe(1);
    });

    test('authenticated user can remove upvote blog post', async () => {
        mockSession(userId, 'USER');
        expect((await upvoteBlogPostComment({ commentId })).success).toBe(true);
        expect((await prisma.blogPostCommentUpvote.findMany({ where: { commentId } })).length).toBe(0);
    });
});
