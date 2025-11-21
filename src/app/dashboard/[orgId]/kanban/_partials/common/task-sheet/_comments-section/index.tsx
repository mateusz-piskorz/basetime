'use client';

import { CommentCard } from '@/components/common/comment-card';
import { CommentForm } from '@/components/common/comment-form';
import { createTaskComment, updateTaskComment } from '@/lib/server-actions/task';
import { trpc, TrpcRouterOutput } from '@/lib/trpc/client';
import { toast } from 'sonner';

type Props = { task: NonNullable<TrpcRouterOutput['task']> };

export const CommentsSection = ({ task }: Props) => {
    const trpcUtils = trpc.useUtils();

    return (
        <div className="space-y-10 px-4">
            <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">Comments</h3>
                <span className="text-muted-foreground">({task.TaskComments.length})</span>
            </div>
            <div className="space-y-8">
                {task.TaskComments.map(({ id, Author, content, isOwner, updatedAt }) => {
                    return (
                        <CommentCard
                            key={id}
                            author={Author}
                            content={content}
                            isOwner={isOwner}
                            updatedAt={updatedAt}
                            onEdit={async ({ content }) => {
                                const res = await updateTaskComment({ content, taskCommentId: id });
                                if (!res.success) {
                                    toast.error(res.message);
                                    return;
                                }
                                toast.success('comment updated successfully');
                                trpcUtils.task.refetch({ taskId: task.id });
                            }}
                        />
                    );
                })}
            </div>
            <CommentForm
                onSubmit={async ({ content, formReset }) => {
                    const res = await createTaskComment({ content, taskId: task.id });
                    if (!res.success) {
                        toast.error(res.message);
                        return;
                    }
                    toast.success('comment created successfully');
                    trpcUtils.task.refetch({ taskId: task.id });
                    formReset({ content: '' });
                }}
            />
        </div>
    );
};
