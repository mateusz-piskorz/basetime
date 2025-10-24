'use client';

import { TextareaField } from '@/components/common/form-fields/textarea-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { createBlogPostComment } from '@/lib/server-actions/blog-post';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';
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
        await trpcUtils.blogPostComments.refetch();
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn('mb-6 space-y-8', !parentId && 'px-6')}>
                <div className="dark:bg-input/30 border-input rounded-md">
                    <TextareaField
                        form={form}
                        name="content"
                        placeholder="What are your thoughts?"
                        classNameInput="border-none  max-h-[150px] resize-none  dark:bg-transparent"
                    />

                    <div className="flex justify-end gap-2 p-4">
                        <Button type="button" onClick={() => form.reset({ blogPostId, parentId, content: '' })} variant="link">
                            Cancel
                        </Button>
                        <Button disabled={form.formState.isSubmitting} type="submit" variant="secondary">
                            Respond
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
};
