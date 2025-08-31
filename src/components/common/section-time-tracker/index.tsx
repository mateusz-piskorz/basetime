'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { Form } from '@/components/ui/form';
import { useMember } from '@/lib/hooks/use-member';
import { startTimeTracker, stopTimeTracker } from '@/lib/server-actions/time-entry';
import { trpc } from '@/lib/trpc/client';
import { startTimeTrackerSchema } from '@/lib/zod/time-entry-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { InputField } from '../form-fields/input-field';
import { SelectField } from '../form-fields/select-field';
import { StartButton } from '../start-button';

export const SectionTimeTracker = () => {
    const trpcUtils = trpc.useUtils();
    const { id } = useMember().member;
    const { data: activeTimeEntry, isLoading: activeTimeEntryLoading, refetch } = trpc.getActiveTimeEntry.useQuery({ memberId: id });
    const { member } = useMember();
    const { data: projects, isLoading, isError } = trpc.getProjects.useQuery({ organizationId: member.organizationId });
    const form = useForm({
        resolver: zodResolver(startTimeTrackerSchema),
    });

    const onSubmit = async (data: z.infer<typeof startTimeTrackerSchema>) => {
        let res;
        if (activeTimeEntry) {
            res = await stopTimeTracker({ timeEntryId: activeTimeEntry.id });
        } else {
            res = await startTimeTracker({ data: { ...data, organizationId: member.organizationId, memberId: member.id } });
        }

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        refetch();
        trpcUtils.getMemberTimeEntries.refetch({ memberId: member.id });
    };

    return (
        <div className="space-y-8 px-4 md:px-8">
            <DashboardHeading className="mb-8" title="Time Tracker" description="Pick project and start tracking time" />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-8" style={{ marginBottom: '16px' }}>
                    <div className="relative w-full">
                        <InputField
                            errorMessage={false}
                            form={form}
                            name="name"
                            placeholder="What are you working on?"
                            classNameInput="h-14 text-xl md:text-xl"
                        />
                        <SelectField
                            size="sm"
                            className="absolute top-1/2 right-4 -translate-y-1/2"
                            disabled={isLoading}
                            form={form}
                            name="projectId"
                            placeholder="No Project"
                            selectOptions={(projects || [])?.map(({ id, name }) => ({ label: name, value: id }))}
                        />
                    </div>

                    <StartButton
                        disabled={activeTimeEntryLoading || form.formState.isSubmitting}
                        type="submit"
                        actionState={activeTimeEntry ? 'stop' : 'start'}
                    />
                </form>
            </Form>
        </div>
    );
};
