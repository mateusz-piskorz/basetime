/* eslint-disable react-hooks/exhaustive-deps */

import { SelectKanbanColumnStatusField } from '@/components/common/form-fields/select-kanban-column-status-field';
import { SelectProjectField } from '@/components/common/form-fields/select-project-field';
import { Form } from '@/components/ui/form';
import { TrpcRouterOutput } from '@/lib/trpc/client';
import { formatMinutes } from '@/lib/utils/common';
import { updateTaskDetailsSchema } from '@/lib/zod/task-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { FolderClosed, Loader } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

type Props = {
    task: NonNullable<TrpcRouterOutput['task']>;
};

export const DetailsForm = ({ task }: Props) => {
    const form = useForm<z.infer<typeof updateTaskDetailsSchema>>({ resolver: zodResolver(updateTaskDetailsSchema) });

    const onSubmit = async (data: z.infer<typeof updateTaskDetailsSchema>) => {
        console.log(data);
    };

    React.useEffect(() => {
        form.reset(
            task
                ? {
                      assignedMemberId: task.assignedId,
                      ETA: task.estimatedMinutes ? formatMinutes(task.estimatedMinutes) : undefined,
                      projectId: task.projectId,
                      priority: task.priority,
                      kanbanColumnId: task.kanbanColumnId,
                  }
                : {},
        );
    }, [task, form.formState.isSubmitSuccessful]);
    const status = form.watch('kanbanColumnId');
    console.log(status);
    return (
        <Form {...form}>
            <form
                onSubmit={(event) => {
                    // event.stopPropagation();
                    form.handleSubmit(onSubmit)(event);
                }}
                className="space-y-5"
            >
                <div className="flex justify-between">
                    <div className="flex gap-2">
                        <FolderClosed className="size-5" />
                        <p>Project</p>
                    </div>
                    <SelectProjectField form={form} name="projectId" />
                </div>

                <div className="flex justify-between">
                    <div className="flex gap-2">
                        <Loader className="size-5" />
                        <p>Status</p>
                    </div>

                    <SelectKanbanColumnStatusField form={form} name="kanbanColumnId" />
                </div>
            </form>
        </Form>
    );
};
