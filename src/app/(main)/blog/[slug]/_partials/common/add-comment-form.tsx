'use client';

import { TextareaField } from '@/components/common/form-fields/textarea-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useBlogCommentsSheet } from '@/lib/hooks/use-blog-comments-sheet';
import { createBlogPostComment } from '@/lib/server-actions/blog-post';
import { trpc, TrpcRouterInput } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';
import { blogPostCommentSchema } from '@/lib/zod/blog-post-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type Props = {
    parentId?: string;
    infiniteQueryArgs: TrpcRouterInput['blogPostComments'];
    onCommentAdded?: () => void;
    onCancel?: () => void;
    newCommentPosition: 'first' | 'last';
};

export const AddCommentForm = ({ parentId, infiniteQueryArgs, onCommentAdded, newCommentPosition, onCancel }: Props) => {
    const { postId, limitQuery } = useBlogCommentsSheet();
    const trpcUtils = trpc.useUtils();
    const form = useForm({
        resolver: zodResolver(blogPostCommentSchema),
    });

    useEffect(() => {
        form.reset({ postId, parentId, content: '' });
    }, [form, form.formState.isSubmitSuccessful, postId, parentId]);

    const onSubmit = async (formData: z.infer<typeof blogPostCommentSchema>) => {
        const res = await createBlogPostComment(formData);

        if (res.success && res.data) {
            await trpcUtils.blogPostComments.cancel(infiniteQueryArgs);
            trpcUtils.blogPostComments.setInfiniteData(infiniteQueryArgs, (data) => {
                const commentData = {
                    ...res.data,
                    createdAt: String(res.data.createdAt),
                    updatedAt: String(res.data.updatedAt),
                    upvotedByUser: false,
                    isOwner: true,
                };
                if (!data) {
                    return {
                        pageParams: [1],
                        pages: [
                            {
                                totalPages: 1,
                                hasMore: false,
                                total: 1,
                                limit: limitQuery,
                                page: 1,
                                data: [commentData],
                            },
                        ],
                    };
                }

                return {
                    ...data,

                    pages: data.pages.map((page, index) => {
                        if (index === (newCommentPosition === 'first' ? 0 : data.pages.length - 1)) {
                            return {
                                ...page,
                                data: newCommentPosition === 'first' ? [commentData, ...page.data] : [...page.data, commentData],
                            };
                        }
                        return page;
                    }),
                };
            });
            toast.success('commented successfully!', { duration: 1500 });

            onCommentAdded?.();
        } else toast.error(res.message || 'something went wrong - AddCommentForm');
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
                        <Button
                            type="button"
                            onClick={() => {
                                onCancel?.();
                                form.reset({ postId, parentId, content: '' });
                            }}
                            variant="link"
                        >
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
