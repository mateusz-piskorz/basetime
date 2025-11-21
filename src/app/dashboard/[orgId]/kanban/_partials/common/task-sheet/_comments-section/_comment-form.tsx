import { TextareaField } from '@/components/common/form-fields/textarea-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useMember } from '@/lib/hooks/use-member';
import { createTaskComment, updateTaskComment } from '@/lib/server-actions/task';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { TaskComment } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type Props = { taskComment?: TaskComment; taskId: string; onComplete: () => void };
const schema = z.object({ content: z.string().nonempty() });

export const CommentForm = ({ taskComment, taskId, onComplete }: Props) => {
    const { orgId } = useMember();
    const trpcUtils = trpc.useUtils();
    const defaultValues = { content: taskComment?.content || '' };

    const form = useForm({ resolver: zodResolver(schema), defaultValues });

    const onSubmit = async ({ content }: z.infer<typeof schema>) => {
        let res;
        if (taskComment) res = await updateTaskComment({ content, taskCommentId: taskComment.id });
        else res = await createTaskComment({ content, taskId });

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        form.reset({ content });
        trpcUtils.task.refetch({ taskId });
        if (taskComment) trpcUtils.kanbanColumns.refetch({ orgId });

        toast.success(`Comment ${taskComment ? 'updated' : 'created'} successfully`);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-6 text-sm')}>
                <div className="dark:bg-input/30 rounded-md border">
                    <TextareaField
                        placeholder="What are your thoughts?"
                        form={form}
                        name="content"
                        classNameInput="border-none shadow-none max-h-[150px] resize-none dark:bg-transparent"
                    />

                    <div className="flex justify-end gap-2 p-4">
                        <Button
                            type="button"
                            onClick={() => {
                                form.reset(defaultValues);
                                onComplete?.();
                            }}
                            variant="link"
                        >
                            Cancel
                        </Button>
                        <Button disabled={!form.formState.isDirty || form.formState.isSubmitting} type="submit" variant="secondary">
                            {taskComment ? 'Save' : 'Respond'}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
};
