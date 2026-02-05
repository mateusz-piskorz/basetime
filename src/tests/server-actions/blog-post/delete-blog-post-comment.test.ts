import { prisma } from '@/lib/prisma';
import { deleteBlogPostComment } from '@/lib/server-actions/blog-post';

import { mockSession } from '@/tests/utils/mock-session';

const userId1 = 'userId4';
const userId2 = 'userId5';
const postId = 'blogPostId4';

const rootComment1 = {
    id: 'rootComment1',
    reply1: {
        id: 'reply1',
        replyNestedLv1: {
            id: 'replyNestLv1',
            replyNestedLv2: 'replyNestedLv2',
        },
    },
    reply2: 'reply2',
};
const rootComment2 = 'rootComment2';

beforeEach(async () => {
    await prisma.blogPostComment.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.createMany({
        data: [
            { id: userId1, email: '1', password: '', name: 'User 1' },
            { id: userId2, email: '2', password: '', name: 'User 2' },
        ],
    });
    await prisma.blogPost.create({ data: { id: postId, content: '', slug: '', title: '' } });

    await prisma.blogPostComment.create({
        data: { id: rootComment2, content: '', postId, authorId: userId2 },
    });

    await prisma.blogPostComment.create({
        data: {
            id: rootComment1.id,
            content: '',
            postId,
            authorId: userId1,
            deleted: true,
            Replies: {
                create: [
                    {
                        id: rootComment1.reply1.id,
                        content: '',
                        authorId: userId1,
                        deleted: true,
                        postId,
                        Replies: {
                            create: {
                                id: rootComment1.reply1.replyNestedLv1.id,
                                content: '',
                                authorId: userId1,
                                postId,
                                deleted: true,
                                Replies: {
                                    create: {
                                        id: rootComment1.reply1.replyNestedLv1.replyNestedLv2,
                                        content: '',
                                        authorId: userId1,
                                        postId,
                                    },
                                },
                            },
                        },
                    },
                    {
                        id: rootComment1.reply2,
                        content: '',
                        authorId: userId1,
                        postId,
                    },
                ],
            },
        },
    });
});
test('unauthenticated user cannot delete comment', async () => {
    const result = await deleteBlogPostComment({ commentId: rootComment2 });
    expect(result.success).toBe(false);
    expect(await prisma.blogPostComment.count({ where: { postId } })).toBe(6);
});

test(`authenticated user cannot delete someone's comment`, async () => {
    mockSession(userId1, { role: 'USER' });
    const result = await deleteBlogPostComment({ commentId: rootComment2 });
    expect(result.success).toBe(false);
});

test('authenticated user can delete comment without replies (hard delete)', async () => {
    mockSession(userId2, { role: 'USER' });
    const result = await deleteBlogPostComment({ commentId: rootComment2 });
    expect(result.success).toBe(true);
    expect(await prisma.blogPostComment.findUnique({ where: { id: rootComment2 } })).toBeNull();
});

test('comment with replies should be soft deleted', async () => {
    mockSession(userId1, { role: 'USER' });
    const targetId = rootComment1.reply1.replyNestedLv1.id;

    const result = await deleteBlogPostComment({ commentId: targetId });

    expect(result.success).toBe(true);
    const comment = await prisma.blogPostComment.findUnique({ where: { id: targetId } });
    expect(comment?.deleted).toBe(true);

    expect(await prisma.blogPostComment.count({ where: { postId } })).toBe(6);
});

test('removing last active reply should recursively remove parents marked as deleted', async () => {
    mockSession(userId1, { role: 'USER' });
    const targetId = rootComment1.reply1.replyNestedLv1.replyNestedLv2;

    const result = await deleteBlogPostComment({ commentId: targetId });

    expect(result.success).toBe(true);

    expect(await prisma.blogPostComment.findUnique({ where: { id: targetId } })).toBeNull();
    expect(await prisma.blogPostComment.findUnique({ where: { id: rootComment1.reply1.replyNestedLv1.id } })).toBeNull();
    expect(await prisma.blogPostComment.findUnique({ where: { id: rootComment1.reply1.id } })).toBeNull();

    expect(await prisma.blogPostComment.findUnique({ where: { id: rootComment1.id } })).not.toBeNull();
});
