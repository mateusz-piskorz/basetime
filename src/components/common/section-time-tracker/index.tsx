/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useMember } from '@/lib/hooks/use-member';
import { toggleTimer } from '@/lib/server-actions/time-entry';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';
import { startTimerSchema } from '@/lib/zod/time-entry-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { DashboardHeading } from '../dashboard-heading';
import { SelectProjectField } from '../form-fields/select-project-field';
import { SelectTaskField } from '../form-fields/select-task-field';
import { TimeEntrySelectField } from '../form-fields/time-entry-select-field';
import { StartButton } from '../start-button';
import { Timer } from './_timer';

type Props = {
    className?: string;
};

export const SectionTimeTracker = ({ className }: Props) => {
    const trpcUtils = trpc.useUtils();
    const {
        member: { id: memberId },
        orgId,
    } = useMember();

    const { data: activeTimeEntry, refetch, isFetching } = trpc.activeTimeEntry.useQuery({ memberId });

    useEffect(() => {
        if (activeTimeEntry) form.reset(activeTimeEntry);
    }, [isFetching]);

    useEffect(() => {
        if (activeTimeEntry) refetch();
    }, []);

    const form = useForm({ resolver: zodResolver(startTimerSchema), defaultValues: { projectId: 'no-project' } });

    const onSubmit = async (data: z.infer<typeof startTimerSchema>) => {
        let res;

        if (activeTimeEntry) {
            res = await toggleTimer({ orgId });
            form.reset({ name: '', projectId: 'no-project', taskId: 'no-task' });
        } else {
            const projectId = data.projectId === 'no-project' ? undefined : data.projectId;
            const taskId = data.taskId === 'no-task' ? undefined : data.taskId;
            res = await toggleTimer({ name: data.name, projectId, orgId, taskId });
        }

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        refetch();
        trpcUtils.timeEntriesByMember.refetch({ orgId });
        trpcUtils.timeEntriesPaginated.refetch({ orgId });
    };

    return (
        <div className={cn('space-y-8 px-4 md:px-6 lg:px-8', className)}>
            <DashboardHeading className="mb-4" title="Time Tracker" />
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-x-8 gap-y-4 md:flex-row md:items-center"
                    style={{ marginBottom: '16px' }}
                >
                    <div
                        className={cn(
                            'border-input relative flex h-12 w-full rounded border md:h-14',
                            'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
                        )}
                    >
                        <TimeEntrySelectField
                            form={form}
                            name="name"
                            onSelect={async (timeEntry) => {
                                if (timeEntry.projectId) form.setValue('projectId', timeEntry.projectId);
                                form.handleSubmit(onSubmit)();
                            }}
                            disabled={Boolean(activeTimeEntry) || isFetching || form.formState.isSubmitting}
                            classNameInput={cn(
                                'h-full border-none bg-transparent md:text-base dark:bg-transparent',
                                'selection:bg-transparent focus-visible:ring-[0px]',
                            )}
                            className="h-full w-full"
                            placeholder="What you working on?"
                        />

                        <div className="flex h-full items-center gap-2 pr-2 sm:gap-4 sm:pr-4">
                            <SelectProjectField
                                form={form}
                                name="projectId"
                                disabled={Boolean(activeTimeEntry) || isFetching || form.formState.isSubmitting}
                                size="sm"
                                className="hidden md:block"
                            />

                            <SelectTaskField
                                className="hidden md:block"
                                form={form}
                                name="taskId"
                                size="sm"
                                projectId={form.watch('projectId') || undefined}
                                disabled={
                                    form.watch('projectId') === 'no-project' || Boolean(activeTimeEntry) || isFetching || form.formState.isSubmitting
                                }
                            />

                            <Separator orientation="vertical" />
                            <Timer
                                key={activeTimeEntry ? activeTimeEntry.id : 'timer-0'}
                                startDate={activeTimeEntry ? dayjs().subtract(activeTimeEntry.startNowDiffMs, 'ms').toDate() : new Date()}
                                isActive={Boolean(activeTimeEntry)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-8 md:hidden">
                            <SelectProjectField
                                form={form}
                                name="projectId"
                                disabled={Boolean(activeTimeEntry) || isFetching || form.formState.isSubmitting}
                                size="lg"
                                className="w-[150px]"
                            />

                            <SelectTaskField
                                className="w-[150px]"
                                form={form}
                                name="taskId"
                                size="lg"
                                projectId={form.watch('projectId') || undefined}
                                disabled={
                                    form.watch('projectId') === 'no-project' || Boolean(activeTimeEntry) || isFetching || form.formState.isSubmitting
                                }
                            />
                        </div>

                        <StartButton
                            disabled={form.formState.isSubmitting || isFetching}
                            type="submit"
                            actionState={activeTimeEntry ? 'stop' : 'start'}
                        />
                    </div>
                </form>
            </Form>
        </div>
    );
};
