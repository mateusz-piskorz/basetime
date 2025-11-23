/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import ConfirmDialog from '@/components/common/confirm-dialog';
import { SelectKanbanColumnStatusField } from '@/components/common/form-fields/custom-select/select-kanban-column-status-field';
import { InputField } from '@/components/common/form-fields/input-field';
import { SelectField } from '@/components/common/form-fields/select-field';
import { TextareaField } from '@/components/common/form-fields/textarea-field';

import { SelectTaskPriorityField } from '@/components/common/form-fields/custom-select/select-task-priority-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useMember } from '@/lib/hooks/use-member';
import { createTask, deleteTask, updateTask } from '@/lib/server-actions/task';
import { trpc, TrpcRouterOutput } from '@/lib/trpc/client';
import { formatMinutes } from '@/lib/utils/common';
import { upsertTaskSchema } from '@/lib/zod/task-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import durationParser from 'parse-duration';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { SelectProjectField } from '../../../../../../components/common/form-fields/custom-select/select-project-field';
import { DurationField } from '../../../../../../components/common/form-fields/duration-field';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
    selectedTask?: NonNullable<TrpcRouterOutput['kanbanColumns']>[number]['Tasks'][number];
    onSuccess?: () => void;
};

export const UpsertTaskDialog = ({ open, setOpen, selectedTask, onSuccess }: Props) => {
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const trpcUtils = trpc.useUtils();
    const { orgId } = useMember();
    const form = useForm<z.infer<typeof upsertTaskSchema>>({ resolver: zodResolver(upsertTaskSchema) });

    React.useEffect(() => {
        const st = selectedTask;
        form.reset(
            st
                ? {
                      name: st.name,
                      description: st.description,
                      assignedMemberId: st.assignedId,
                      ETA: st.estimatedMinutes ? formatMinutes(st.estimatedMinutes) : undefined,
                      projectId: st.projectId,
                      priority: st.priority,
                      kanbanColumnId: st.kanbanColumnId,
                  }
                : { assignedMemberId: null, priority: 'MINOR' },
        );
    }, [selectedTask, form.formState.isSubmitSuccessful]);

    async function onSubmit({ name, priority, assignedMemberId, description, ETA, projectId, kanbanColumnId }: z.infer<typeof upsertTaskSchema>) {
        let res;

        if (selectedTask) {
            res = await updateTask({
                taskId: selectedTask.id,
                name,
                priority,
                projectId,
                assignedMemberId,
                description,
                estimatedMinutes: durationParser(ETA ?? undefined, 'm'),
                kanbanColumnId,
            });
        } else {
            res = await createTask({
                name,
                priority,
                orgId,
                projectId,
                assignedMemberId,
                description,
                estimatedMinutes: durationParser(ETA ?? undefined, 'm'),
                kanbanColumnId,
            });
        }

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        trpcUtils.kanbanColumns.refetch();
        trpcUtils.tasks.refetch();
        toast.success(`Task ${selectedTask ? 'Updated' : 'Created'} successfully`);
        onSuccess?.();
        setOpen(false);
    }

    const { data: members } = trpc.members.useQuery({ orgId });

    return (
        <>
            {Boolean(selectedTask) && (
                <ConfirmDialog
                    open={confirmOpen}
                    setOpen={setConfirmOpen}
                    onContinue={async () => {
                        const res = await deleteTask({ taskId: selectedTask!.id });
                        if (res.success) {
                            toast.success('Task deleted successfully');
                            trpcUtils.kanbanColumns.refetch();
                            setOpen(false);
                            return;
                        }
                        toast.error(res.message || 'something went wrong - deleteKanbanColumn');
                    }}
                    title="Do you really want to remove Task?"
                    description="This action cannot be undone. Task will be removed permanently"
                />
            )}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedTask ? 'Update' : 'Create'} Task</DialogTitle>
                        <DialogDescription>Fill in the details below to {selectedTask ? 'Update' : 'Create'} Task</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form
                            onSubmit={(event) => {
                                event.stopPropagation();
                                form.handleSubmit(onSubmit)(event);
                            }}
                            className="flex flex-col gap-y-6"
                        >
                            <div className="flex items-start gap-2">
                                <SelectProjectField form={form} name="projectId" className="w-full" label="Project" />
                                <SelectKanbanColumnStatusField form={form} name="kanbanColumnId" className="w-full" label="Status" />
                            </div>
                            <div className="flex items-start gap-2">
                                <SelectField
                                    className="w-full"
                                    nullOption="Unassigned"
                                    label="Assigned member"
                                    form={form}
                                    name="assignedMemberId"
                                    selectOptions={(members || []).map((member) => ({
                                        label: member.User.name.toLowerCase(),
                                        value: member.id,
                                    }))}
                                />
                                <SelectTaskPriorityField form={form} name="priority" label="Priority" />
                            </div>

                            <InputField form={form} name="name" label="Name" />
                            <TextareaField
                                form={form}
                                name="description"
                                label="Description"
                                classNameInput="resize-none min-h-[100px] max-h-[150px]"
                            />

                            <DurationField label="ETA" className="w-full" form={form} name="ETA" />

                            <p className="text-muted-foreground -mt-4 text-sm">you can type human language here e.g. 2h 30m</p>

                            <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={form.formState.isSubmitting}>
                                Submit
                            </Button>
                        </form>
                    </Form>
                    {/* todo: minor */}
                    {/* looks cool, extract to separate component, check other places where we use it */}
                    {Boolean(selectedTask) && (
                        <div className="space-y-4 rounded-lg border border-red-200 bg-red-100 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                            <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                                <p className="font-medium">Warning</p>
                                <p className="text-sm">Please proceed with caution, this cannot be undone.</p>
                                <Button className="mt-3" variant="destructive" onClick={() => setConfirmOpen(true)}>
                                    Delete Task
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
