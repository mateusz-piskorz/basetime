import z from 'zod';

export const blogPostCommentSchema = z.object({
    postId: z.string(),
    content: z.string(),
    parentId: z.string().optional(),
});

export const blogPostCommentUpvoteSchema = z.object({
    commentId: z.string(),
});

export const blogPostCommentDeleteSchema = z.object({
    commentId: z.string(),
});

export const blogPostUpvoteSchema = z.object({
    postId: z.string(),
});
