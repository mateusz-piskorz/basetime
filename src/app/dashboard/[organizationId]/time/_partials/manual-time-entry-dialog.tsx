'use client';

/* eslint-disable react-hooks/exhaustive-deps */
import { InputField } from '@/components/common/form-fields/input-field';
import { TimeEntrySelectField } from '@/components/common/form-fields/time-entry-select-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useDayjs } from '@/lib/hooks/use-dayjs';
import { useMember } from '@/lib/hooks/use-member';
import { manualTimeEntry } from '@/lib/server-actions/time-entry';
import { trpc, TrpcRouterOutput } from '@/lib/trpc/client';
import { formatMinutes, getDurationInMinutes, prepareDateTime } from '@/lib/utils/common';
import { manualTimeEntrySchema } from '@/lib/zod/time-entry-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { CalendarField } from '../../../../../components/common/form-fields/calendar-field';
import { DurationField } from '../../../../../components/common/form-fields/duration-field';
import { SelectProjectField } from '../../../../../components/common/form-fields/select-project-field';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
    selectedTimeEntry?: NonNullable<TrpcRouterOutput['timeEntriesPaginated']>['data'][number];
    onSuccess?: () => void;
};

export const ManualTimeEntryDialog = ({ open, setOpen, selectedTimeEntry, onSuccess }: Props) => {
    const { dayjs } = useDayjs();
    const trpcUtils = trpc.useUtils();
    const { organizationId } = useMember();
    const form = useForm<z.infer<typeof manualTimeEntrySchema>>({
        resolver: zodResolver(manualTimeEntrySchema),
        defaultValues: {
            endDate: new Date(),
            endTime: '08:30',
            startDate: new Date(),
            startTime: '07:00',
            duration: '1h 30min',
            projectId: 'no-project',
        },
    });

    useEffect(() => {
        const ste = selectedTimeEntry;

        form.reset(
            ste
                ? {
                      name: ste.name,
                      projectId: ste.projectId || 'no-project',
                      startDate: new Date(ste.start),
                      startTime: dayjs(ste.start).format('HH:mm'),
                      endDate: ste.end ? new Date(ste.end) : new Date(),
                      endTime: dayjs(ste.end || new Date()).format('HH:mm'),
                      duration: formatMinutes(
                          getDurationInMinutes({ dayjs, start: new Date(ste.start), end: ste.end ? new Date(ste.end) : new Date() }),
                      ),
                  }
                : undefined,
        );
    }, [selectedTimeEntry, form.formState.isSubmitSuccessful]);

    async function onSubmit({ endDate, endTime, startDate, startTime, name, projectId }: z.infer<typeof manualTimeEntrySchema>) {
        const start = prepareDateTime({ date: startDate, time: startTime, dayjs });
        const end = prepareDateTime({ date: endDate, time: endTime, dayjs });

        const res = await manualTimeEntry({
            organizationId,
            name,
            projectId: projectId === 'no-project' ? undefined : projectId,
            start,
            end,
            timeEntryId: selectedTimeEntry?.id,
        });

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        trpcUtils.timeEntriesPaginated.refetch();
        toast.success(`TimeEntry ${selectedTimeEntry ? 'Updated' : 'Created'} successfully`);
        onSuccess?.();
        setOpen(false);
    }

    const updateDurationField = () => {
        const startDate = dayjs(prepareDateTime({ dayjs, date: form.getValues('startDate'), time: form.getValues('startTime') }));
        const endDate = dayjs(prepareDateTime({ dayjs, date: form.getValues('endDate'), time: form.getValues('endTime') }));

        const minutesDiff = endDate.diff(startDate, 'm');
        form.setValue('duration', formatMinutes(minutesDiff));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{selectedTimeEntry ? 'Update' : 'Create'} TimeEntry</DialogTitle>
                    <DialogDescription>Fill in the details below to {selectedTimeEntry ? 'Update' : 'Create'} TimeEntry</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={(event) => {
                            event.stopPropagation();
                            form.handleSubmit(onSubmit)(event);
                        }}
                        className="flex flex-col gap-y-6"
                    >
                        <div className="flex">
                            <TimeEntrySelectField
                                form={form}
                                name="name"
                                onSelect={(timeEntry) => {
                                    if (timeEntry.projectId) form.setValue('projectId', timeEntry.projectId);
                                }}
                                placeholder="What did you work on?"
                            />
                        </div>
                        <div className="flex flex-col gap-6 sm:flex-row-reverse sm:items-end sm:gap-4">
                            <SelectProjectField form={form} name="projectId" textClassName="max-sm:max-w-full" />

                            <DurationField
                                label="Duration"
                                className="w-full"
                                form={form}
                                name="duration"
                                onBlur={(minutes) => {
                                    const endDate = form.getValues('endDate');
                                    const endTime = form.getValues('endTime');
                                    const startDate = dayjs(prepareDateTime({ date: endDate, time: endTime, dayjs })).add(-(minutes || 90), 'm');

                                    form.setValue('startDate', startDate.toDate());
                                    form.setValue('startTime', startDate.format('HH:mm'));
                                }}
                            />
                        </div>
                        <p className="text-muted-foreground -mt-4 text-sm">you can type human language here e.g. 2h 30m</p>

                        <div className="mt-10 flex items-end gap-4">
                            <CalendarField label="Start" form={form} name="startDate" onSelect={updateDurationField} className="w-full" />
                            <InputField
                                type="time"
                                form={form}
                                name="startTime"
                                onBlur={updateDurationField}
                                className="w-full max-w-[105px]"
                                classNameInput="h-[42px]"
                            />
                        </div>

                        <div className="flex items-end gap-4">
                            <CalendarField label="End" form={form} name="endDate" onSelect={updateDurationField} className="w-full" />
                            <InputField
                                type="time"
                                form={form}
                                name="endTime"
                                onBlur={updateDurationField}
                                className="w-full max-w-[105px]"
                                classNameInput="h-[42px]"
                            />
                        </div>

                        <Button type="submit" className="w-full sm:w-auto" size="lg">
                            Submit
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
