'use client';

import { TextareaField } from '@/components/common/form-fields/textarea-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useBlogCommentsSheet } from '@/lib/hooks/use-blog-comments-sheet';
import { createBlogPostComment } from '@/lib/server-actions/blog-post';
import { trpc, TrpcRouterInput, TrpcRouterOutput } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';
import { blogPostCommentSchema } from '@/lib/zod/blog-post-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type Props = {
    parentComment?: NonNullable<TrpcRouterOutput['blogPostComments']>['data'][number];
    infiniteQueryArgs: TrpcRouterInput['blogPostComments'];
    onCommentAdded?: () => void;
    onCancel?: () => void;
};

export const AddCommentForm = ({ parentComment, infiniteQueryArgs, onCommentAdded, onCancel }: Props) => {
    const { postId, limitQuery, sorting } = useBlogCommentsSheet();
    const trpcUtils = trpc.useUtils();
    const form = useForm({
        resolver: zodResolver(blogPostCommentSchema),
    });

    useEffect(() => {
        form.reset({ postId, parentId: parentComment?.id, content: '' });
    }, [form, form.formState.isSubmitSuccessful, postId, parentComment]);

    const onSubmit = async (formData: z.infer<typeof blogPostCommentSchema>) => {
        const res = await createBlogPostComment(formData);

        if (res.success && res.data) {
            if (parentComment) {
                trpcUtils.blogPostComments.refetch({
                    ...infiniteQueryArgs,
                    parentId: parentComment.parentId,
                    sorting: parentComment.parentId ? 'oldest' : sorting,
                });
                trpcUtils.blogPostComments.refetch(infiniteQueryArgs);
            } else {
                trpcUtils.blogPostComments.cancel(infiniteQueryArgs);
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
                            if (index === 0) {
                                return { ...page, data: [commentData, ...page.data] };
                            }
                            return page;
                        }),
                    };
                });
            }

            toast.success('commented successfully!', { duration: 1500 });

            onCommentAdded?.();
        } else {
            toast.error(res.message || 'something went wrong - AddCommentForm');
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn('mb-6 space-y-8', !parentComment && 'px-6')}>
                <div className="dark:bg-input/30 rounded-md border">
                    <TextareaField
                        autoFocus
                        form={form}
                        name="content"
                        placeholder="What are your thoughts?"
                        classNameInput="border-none shadow-none max-h-[150px] resize-none dark:bg-transparent"
                    />

                    <div className="flex justify-end gap-2 p-4">
                        <Button
                            type="button"
                            onClick={() => {
                                onCancel?.();
                                form.reset({ postId, parentId: parentComment?.id, content: '' });
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
