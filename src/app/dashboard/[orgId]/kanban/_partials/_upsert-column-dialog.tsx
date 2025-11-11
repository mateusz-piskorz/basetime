/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { InputField } from '@/components/common/form-fields/input-field';
import { SelectField } from '@/components/common/form-fields/select-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useMember } from '@/lib/hooks/use-member';
import { createTask } from '@/lib/server-actions/task';
import { trpc, TrpcRouterOutput } from '@/lib/trpc/client';
import { upsertTaskSchema } from '@/lib/zod/task-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import durationParser from 'parse-duration';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { DurationField } from '../../../../../components/common/form-fields/duration-field';
import { SelectProjectField } from '../../../../../components/common/form-fields/select-project-field';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
    selectedTask?: NonNullable<TrpcRouterOutput['tasksPaginated']>['data'][number];
    onSuccess?: () => void;
};

// think about pagination

export const UpsertColumnDialog = ({ open, setOpen, selectedTask, onSuccess }: Props) => {
    const trpcUtils = trpc.useUtils();
    const { orgId } = useMember();
    const form = useForm<z.infer<typeof upsertTaskSchema>>({ resolver: zodResolver(upsertTaskSchema) });

    useEffect(() => {
        const st = selectedTask;
        form.reset(
            st
                ? {
                      name: st.name,
                      description: st.description,
                      assignedMemberId: st.assignedId,
                      duration: String(st.estimatedMinutes),
                      projectId: st.projectId,
                  }
                : undefined,
        );
    }, [selectedTask, form.formState.isSubmitSuccessful]);

    async function onSubmit({ name, assignedMemberId, description, duration, projectId }: z.infer<typeof upsertTaskSchema>) {
        const res = await createTask({
            name,
            orgId,
            projectId,
            assignedMemberId: assignedMemberId === 'null' ? null : assignedMemberId,
            description,
            estimatedMinutes: durationParser(duration ?? undefined, 'm'),
            columnId: null,
        });

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        trpcUtils.tasksPaginated.refetch();
        toast.success(`Task ${selectedTask ? 'Updated' : 'Created'} successfully`);
        onSuccess?.();
        setOpen(false);
    }

    const { data: members } = trpc.members.useQuery({ orgId });

    return (
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
                        <InputField form={form} name="name" label="Name" />
                        <InputField form={form} name="description" label="Description" />
                        <div className="flex flex-col gap-6 sm:flex-row-reverse sm:items-end sm:gap-4">
                            <SelectProjectField form={form} name="projectId" textClassName="max-sm:max-w-full" />
                            <DurationField label="Duration" className="w-full" form={form} name="duration" />
                        </div>
                        <p className="text-muted-foreground -mt-4 text-sm">you can type human language here e.g. 2h 30m</p>

                        <SelectField
                            nullOption="Unassigned"
                            label="AssignedMember"
                            form={form}
                            name="assignedMemberId"
                            selectOptions={(members || []).map((member) => ({ label: member.User.name, value: member.id }))}
                        />

                        <Button type="submit" className="w-full sm:w-auto" size="lg">
                            Submit
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
