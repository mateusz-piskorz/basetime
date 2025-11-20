'use client';

import { SelectKanbanColumnStatusField } from '@/components/common/form-fields/custom-select/select-kanban-column-status-field';
import { SelectMemberField } from '@/components/common/form-fields/custom-select/select-member-field';
import { SelectProjectField } from '@/components/common/form-fields/custom-select/select-project-field';
import { SelectTaskPriorityField } from '@/components/common/form-fields/custom-select/select-task-priority-field';
import { DurationField } from '@/components/common/form-fields/duration-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useMember } from '@/lib/hooks/use-member';
import { updateTask } from '@/lib/server-actions/task';
import { trpc, TrpcRouterOutput } from '@/lib/trpc/client';
import { formatMinutes } from '@/lib/utils/common';
import { updateTaskDetailsSchema } from '@/lib/zod/task-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { FolderClosed, Goal, Hourglass, Loader, UserCheck2 } from 'lucide-react';
import durationParser from 'parse-duration';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type Props = {
    task: NonNullable<TrpcRouterOutput['task']>;
};

export const DetailsForm = ({ task }: Props) => {
    const { estimatedMinutes, projectId, assignedId, priority, kanbanColumnId, id: taskId } = task;
    const { orgId } = useMember();
    const trpcUtils = trpc.useUtils();

    const defaultValues = {
        ETA: estimatedMinutes ? formatMinutes(estimatedMinutes) : undefined,
        projectId,
        assignedMemberId: assignedId,
        priority,
        kanbanColumnId,
    };

    const form = useForm({ resolver: zodResolver(updateTaskDetailsSchema), defaultValues });

    const onSubmit = async (data: z.infer<typeof updateTaskDetailsSchema>) => {
        const { ETA, ...rest } = data;
        const res = await updateTask({
            orgId,
            taskId,
            estimatedMinutes: durationParser(ETA ?? undefined, 'm'),
            ...rest,
        });
        if (!res.success) {
            toast.error(res.message);
            return;
        }

        form.reset(data);

        trpcUtils.kanbanColumns.refetch({ orgId });
        trpcUtils.tasks.refetch();
        trpcUtils.task.refetch({ taskId });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-4 text-sm">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <FolderClosed className="size-5" />
                        <p>Project</p>
                    </div>
                    <SelectProjectField form={form} name="projectId" />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <Loader className="size-5" />
                        <p>Status</p>
                    </div>
                    <SelectKanbanColumnStatusField form={form} name="kanbanColumnId" />
                </div>

                <div className="flex items-center justify-between">
                    <p className="flex gap-2">
                        <Goal className="size-5" /> Priority
                    </p>
                    <SelectTaskPriorityField form={form} name="priority" />
                </div>

                <div className="flex items-center justify-between">
                    <p className="flex gap-2">
                        <Hourglass className="size-5" />
                        ETA
                    </p>
                    <DurationField form={form} name="ETA" />
                </div>

                <div className="flex items-center justify-between">
                    <p className="flex gap-2">
                        <UserCheck2 className="size-5" />
                        Assigned
                    </p>
                    <SelectMemberField form={form} name="assignedMemberId" nullOption />
                </div>

                <div className="flex justify-end gap-2">
                    <Button disabled={!form.formState.isDirty} type="button" onClick={() => form.reset(defaultValues)} variant="link">
                        Cancel
                    </Button>
                    <Button disabled={!form.formState.isDirty || form.formState.isSubmitting} type="submit" variant="secondary">
                        Save
                    </Button>
                </div>
            </form>
        </Form>
    );
};
