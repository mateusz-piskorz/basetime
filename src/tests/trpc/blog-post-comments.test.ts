import { prisma } from '@/lib/prisma';
import { getQueryClient, trpc } from '@/lib/trpc/server-client';
import dayjs from 'dayjs';
import { mockSession } from '../utils/mock-session';

const queryClient = getQueryClient();

const user1Id = 'user1Id';
const user2Id = 'user2Id';
const postId = 'postId';
const comment1Id = 'comment1Id';
const commentOwnerId = 'commentOwnerId';
const commentUpvotedId = 'commentUpvotedId';

afterEach(() => {
    queryClient.clear();
});

beforeAll(async () => {
    await prisma.user.create({ data: { email: '1', name: '', password: '', id: user1Id } });
    await prisma.user.create({ data: { email: '2', name: '', password: '', id: user2Id } });
    await prisma.blogPost.create({
        data: {
            content: '',
            slug: '1',
            title: '',
            id: postId,
            Comments: {
                createMany: {
                    data: [
                        { authorId: user2Id, id: comment1Id, content: '', updatedAt: dayjs().add(3, 'h').toDate() },
                        { authorId: user1Id, id: commentOwnerId, content: '', updatedAt: dayjs().add(1, 'h').toDate() },
                        { authorId: user2Id, id: commentUpvotedId, content: '', updatedAt: dayjs().add(2, 'h').toDate() },
                    ],
                },
            },
        },
    });
    await prisma.blogPostCommentUpvote.create({ data: { commentId: commentUpvotedId, userId: user1Id } });
});

// upvotedByUser

test('returns upvotedByUser', async () => {
    mockSession(user1Id);

    const res = await queryClient.fetchQuery(
        trpc.blogPostComments.queryOptions({ postId, sorting: 'featured', limit: 50, cursor: 1, parentId: null }),
    );

    expect(res.data.find((e) => e.id === commentUpvotedId)?.upvotedByUser).toBe(true);
});

// isOwner

test('returns isOwner', async () => {
    mockSession(user1Id);

    const res = await queryClient.fetchQuery(
        trpc.blogPostComments.queryOptions({ postId, sorting: 'featured', limit: 50, cursor: 1, parentId: null }),
    );

    expect(res.data.find((e) => e.id === commentOwnerId)?.isOwner).toBe(true);
});

// pagination

test('pagination working', async () => {
    mockSession(user1Id);

    const page1 = await queryClient.fetchQuery(
        trpc.blogPostComments.queryOptions({ postId, sorting: 'featured', limit: 2, cursor: 1, parentId: null }),
    );

    expect(page1.data.length).toBe(2);

    const page2 = await queryClient.fetchQuery(
        trpc.blogPostComments.queryOptions({ postId, sorting: 'featured', limit: 2, cursor: 2, parentId: null }),
    );
    expect(page2.data.length).toBe(1);
});

// limit
test('limit arg working', async () => {
    mockSession(user1Id);

    const page1 = await queryClient.fetchQuery(
        trpc.blogPostComments.queryOptions({ postId, sorting: 'featured', limit: 3, cursor: 1, parentId: null }),
    );

    expect(page1.data.length).toBe(3);
});

// sorting
test('sorting arg working', async () => {
    mockSession(user1Id);

    const featured = await queryClient.fetchQuery(
        trpc.blogPostComments.queryOptions({ postId, sorting: 'featured', limit: 50, cursor: 1, parentId: null }),
    );
    expect(featured.data[0].id).toBe(commentUpvotedId);

    const latest = await queryClient.fetchQuery(
        trpc.blogPostComments.queryOptions({ postId, sorting: 'latest', limit: 50, cursor: 1, parentId: null }),
    );
    expect(latest.data[0].id).toBe(comment1Id);

    const oldest = await queryClient.fetchQuery(
        trpc.blogPostComments.queryOptions({ postId, sorting: 'oldest', limit: 50, cursor: 1, parentId: null }),
    );
    expect(oldest.data[0].id).toBe(commentOwnerId);
});
