'use client';

/* eslint-disable react-hooks/exhaustive-deps */
import { InputField } from '@/components/common/form-fields/input-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useMember } from '@/lib/hooks/use-member';
import { manualTimeEntry } from '@/lib/server-actions/time-entry';
import { trpc } from '@/lib/trpc/client';
import { prepareDateTime } from '@/lib/utils';
import { manualTimeEntrySchema } from '@/lib/zod/time-entry-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { CalendarField } from './form-fields/calendar-field';
import { SelectField } from './form-fields/select-field';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
    defaultValues?: z.infer<typeof manualTimeEntrySchema>;
    timeEntryId?: string;
    onSuccess?: () => void;
};

export const ManualTimeEntryDialog = ({ open, setOpen, defaultValues, timeEntryId, onSuccess }: Props) => {
    const { member } = useMember();
    const form = useForm<z.infer<typeof manualTimeEntrySchema>>({
        resolver: zodResolver(manualTimeEntrySchema),
    });

    useEffect(() => {
        form.reset();
    }, [defaultValues, form.formState.isSubmitSuccessful]);

    async function onSubmit({ endDate, endTime, startDate, startTime, name, projectId }: z.infer<typeof manualTimeEntrySchema>) {
        const start = prepareDateTime(startDate, startTime);
        const end = prepareDateTime(endDate, endTime);

        const res = await manualTimeEntry({
            data: { memberId: member.id, organizationId: member.organizationId, name, projectId, start, end },
        });

        if (!res.success) {
            toast.error(res.message);
            return;
        }
        toast.success('Added TimeEntry successfully');
        onSuccess?.();
        setOpen(false);
    }

    const { data: projects, isLoading, isError } = trpc.getProjects.useQuery({ organizationId: member.organizationId });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{timeEntryId ? 'Update' : 'Create'} TimeEntry</DialogTitle>
                    <DialogDescription>Fill in the details below to {timeEntryId ? 'Update' : 'Create'} TimeEntry</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={(event) => {
                            event.stopPropagation();
                            form.handleSubmit(onSubmit)(event);
                        }}
                        className="space-y-5"
                    >
                        <InputField form={form} name="name" label="Name" />
                        <SelectField
                            disabled={isLoading}
                            form={form}
                            name="projectId"
                            placeholder="No Project"
                            selectOptions={(projects || [])?.map(({ id, name }) => ({ label: name, value: id }))}
                        />
                        <h2>Start</h2>
                        <div className="flex gap-4">
                            <CalendarField form={form} name="startDate" />
                            <InputField type="time" form={form} name="startTime" />
                        </div>
                        <h2>End</h2>
                        <div className="flex gap-4">
                            <CalendarField form={form} name="endDate" />
                            <InputField type="time" form={form} name="endTime" />
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
