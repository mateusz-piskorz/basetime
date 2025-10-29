import { prisma } from '@/lib/prisma';
import { getQueryClient, trpc } from '@/lib/trpc/server-client';
import { mockSession } from '../utils/mock-session';

const queryClient = getQueryClient();

const userId = 'userId';
const postId1 = 'post1';
const postId2 = 'post2';

afterEach(() => {
    queryClient.clear();
});

beforeAll(async () => {
    await prisma.user.create({ data: { email: '', name: '', password: '', id: userId } });
    await prisma.blogPost.create({ data: { content: '', slug: '1', title: '', id: postId1, Upvotes: { create: { userId } } } });
    await prisma.blogPost.create({ data: { content: '', slug: '2', title: '', id: postId2 } });
});

test('returns false for unauthenticated user', async () => {
    const res = await queryClient.fetchQuery(trpc.blogPostUpvote.queryOptions({ postId: postId1 }));

    expect(res.userUpvoted).toBe(false);
});

test('returns false for user that has not upvoted post', async () => {
    mockSession(userId);
    const res = await queryClient.fetchQuery(trpc.blogPostUpvote.queryOptions({ postId: postId2 }));

    expect(res.userUpvoted).toBe(false);
});

test('returns true for user that has upvoted post', async () => {
    mockSession(userId);
    const res = await queryClient.fetchQuery(trpc.blogPostUpvote.queryOptions({ postId: postId1 }));

    expect(res.userUpvoted).toBe(true);
});
