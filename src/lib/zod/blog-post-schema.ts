import z from 'zod';

export const blogPostCommentSchema = z.object({
    blogPostId: z.string(),
    content: z.string(),
    parentId: z.string().optional(),
});
