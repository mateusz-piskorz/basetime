/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Form } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useMember } from '@/lib/hooks/use-member';
import { startTimer, stopTimer } from '@/lib/server-actions/time-entry';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';
import { startTimerSchema } from '@/lib/zod/time-entry-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { DashboardHeading } from '../dashboard-heading';
import { SelectProjectField } from '../form-fields/select-project-field';
import { TimeEntrySelectField } from '../form-fields/time-entry-select-field';
import { StartButton } from '../start-button';
import { Timer } from './timer';

type Props = {
    className?: string;
};

export const SectionTimeTracker = ({ className }: Props) => {
    const trpcUtils = trpc.useUtils();
    const {
        member: { id: memberId },
        organizationId,
    } = useMember();

    const { data: activeTimeEntry, isPending, refetch } = trpc.activeTimeEntry.useQuery({ memberId });

    useEffect(() => {
        if (activeTimeEntry) {
            form.reset(activeTimeEntry);
        }
    }, [isPending]);

    const form = useForm({ resolver: zodResolver(startTimerSchema), defaultValues: { projectId: 'no-project' } });

    const onSubmit = async (data: z.infer<typeof startTimerSchema>) => {
        let res;
        if (activeTimeEntry) {
            res = await stopTimer({ timeEntryId: activeTimeEntry.id });
            form.reset({ name: '', projectId: 'no-project' });
        } else {
            const projectId = data.projectId === 'no-project' ? undefined : data.projectId;
            res = await startTimer({ ...data, projectId, organizationId, memberId });
        }

        if (!res.success) {
            toast.error(res.message);
            return;
        }
        refetch();
        trpcUtils.timeEntriesByMember.refetch({ organizationId });
        trpcUtils.timeEntriesPaginated.refetch({ organizationId });
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
                            disabled={Boolean(activeTimeEntry) || isPending || form.formState.isSubmitting}
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
                                disabled={Boolean(activeTimeEntry) || isPending || form.formState.isSubmitting}
                                size="sm"
                                className="hidden md:block"
                            />

                            <Separator orientation="vertical" />
                            <Timer startDate={activeTimeEntry ? new Date(activeTimeEntry.start) : new Date()} isActive={Boolean(activeTimeEntry)} />
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <SelectProjectField
                            form={form}
                            name="projectId"
                            disabled={Boolean(activeTimeEntry) || isPending || form.formState.isSubmitting}
                            size="lg"
                            className="w-[150px] md:hidden"
                        />

                        <StartButton disabled={form.formState.isSubmitting} type="submit" actionState={activeTimeEntry ? 'stop' : 'start'} />
                    </div>
                </form>
            </Form>
        </div>
    );
};
