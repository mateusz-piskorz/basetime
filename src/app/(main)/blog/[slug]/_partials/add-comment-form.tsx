'use client';

import { TextareaField } from '@/components/common/form-fields/textarea-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { createBlogPostComment } from '@/lib/server-actions/blog-post';
import { trpc } from '@/lib/trpc/client';
import { blogPostCommentSchema } from '@/lib/zod/blog-post-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type Props = {
    parentId?: string;
    blogPostId: string;
};

export const AddCommentForm = ({ parentId, blogPostId }: Props) => {
    const trpcUtils = trpc.useUtils();
    const form = useForm({
        resolver: zodResolver(blogPostCommentSchema),
    });

    useEffect(() => {
        form.reset({ blogPostId, parentId, content: '' });
    }, [form, form.formState.isSubmitSuccessful, blogPostId, parentId]);

    const onSubmit = async (data: z.infer<typeof blogPostCommentSchema>) => {
        const res = await createBlogPostComment(data);

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        toast.success('Comment added successfully');
        // trpcUtils.members.refetch()
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="mb-6 space-y-8 px-6">
                <TextareaField form={form} name="content" placeholder="What are your thoughts?" className="max-h-[150px]" />

                <Button disabled={form.formState.isSubmitting} type="submit">
                    Respond
                </Button>
            </form>
        </Form>
    );
};
