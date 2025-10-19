import { initialBlogArticles } from '@/lib/constants/blog-initial-articles';
import { prisma } from '@/lib/prisma';
import { createBlogPost, removeBlogPost, seedBlogPost, updateBlogPost } from '@/lib/server-actions/blog-post';
import { mockSession } from '../utils/mock-session';

describe('createBlogPost', () => {
    const createdBlogPostSlug = 'new-blog-post';
    test('regular user cannot create blog post', async () => {
        mockSession('', 'USER');

        expect((await await createBlogPost({ slug: createdBlogPostSlug })).success).toBe(false);
        expect(await prisma.blogPost.findUnique({ where: { slug: createdBlogPostSlug } })).toBe(null);
    });

    test('admin can create blog post', async () => {
        mockSession('', 'ADMIN');

        expect((await await createBlogPost({ slug: createdBlogPostSlug })).success).toBe(true);
        expect(await prisma.blogPost.findUnique({ where: { slug: createdBlogPostSlug } })).not.toBe(null);
    });
});

describe('updateBlogPost', () => {
    const blogPostId = 'updateBlogPostId';
    beforeAll(async () => {
        await prisma.blogPost.deleteMany({});
        await prisma.blogPost.create({ data: { slug: '', content: '', title: 'old title', id: blogPostId } });
    });

    test('regular user can not update blog post', async () => {
        mockSession('', 'USER');
        expect((await updateBlogPost({ id: blogPostId, title: 'new title' })).success).toBe(false);
        expect((await prisma.blogPost.findUnique({ where: { id: blogPostId } }))?.title).toBe('old title');
    });

    test('admin can update blog post', async () => {
        mockSession('', 'ADMIN');
        expect((await updateBlogPost({ id: blogPostId, title: 'new title' })).success).toBe(true);
        expect((await prisma.blogPost.findUnique({ where: { id: blogPostId } }))?.title).toBe('new title');
    });
});

describe('removeBlogPost', () => {
    const blogPostId = 'removeBlogPostId';
    beforeAll(async () => {
        await prisma.blogPost.deleteMany({});
        await prisma.blogPost.create({ data: { slug: '', content: '', title: '', id: blogPostId } });
    });

    test('regular user can not remove blog post', async () => {
        mockSession('', 'USER');
        expect((await removeBlogPost({ blogPostId })).success).toBe(false);
        expect(await prisma.blogPost.findUnique({ where: { id: blogPostId } })).not.toBe(null);
    });

    test('admin can remove blog post', async () => {
        mockSession('', 'ADMIN');
        expect((await removeBlogPost({ blogPostId })).success).toBe(true);
        expect(await prisma.blogPost.findUnique({ where: { id: blogPostId } })).toBe(null);
    });
});

describe('seedBlogPost', () => {
    beforeAll(async () => {
        await prisma.blogPost.deleteMany({});
    });

    test('regular user can not seed blog post', async () => {
        mockSession('', 'USER');
        expect((await seedBlogPost()).success).toBe(false);
        expect((await prisma.blogPost.findMany()).length).toBe(0);
    });

    test('admin can seed blog post', async () => {
        mockSession('', 'ADMIN');
        expect((await seedBlogPost()).success).toBe(true);
        expect((await prisma.blogPost.findMany()).length).toBe(initialBlogArticles.length);
    });

    test('seedBlogPost can not be used again', async () => {
        mockSession('', 'ADMIN');
        expect((await seedBlogPost()).success).toBe(false);
        expect((await prisma.blogPost.findMany()).length).toBe(initialBlogArticles.length);
    });
});
