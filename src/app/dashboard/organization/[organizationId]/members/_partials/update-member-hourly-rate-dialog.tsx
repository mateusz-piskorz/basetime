import { InputField } from '@/components/common/form-fields/input-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { updateHourlyRate } from '@/lib/server-actions/member';
import { trpc } from '@/lib/trpc/client';
import { updateHourlyRateSchema } from '@/lib/zod/member-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
    onSuccess: () => void;
    memberId: string;
    userName: string;
    defaultValues: z.infer<typeof updateHourlyRateSchema>;
};

export const UpdateMemberHourlyRateDialog = ({ open, setOpen, onSuccess, userName, memberId, defaultValues }: Props) => {
    const trpcUtils = trpc.useUtils();
    const form = useForm({
        resolver: zodResolver(updateHourlyRateSchema),
        defaultValues,
    });

    useEffect(() => {
        form.reset();
    }, [form, form.formState.isSubmitSuccessful]);

    const onSubmit = async (data: z.infer<typeof updateHourlyRateSchema>) => {
        const res = await updateHourlyRate({ data, memberId });

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        toast.success('Member hourly rate updated successfully');
        trpcUtils.getMembers.refetch();
        onSuccess();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogTitle>Preview and manage {userName}</DialogTitle>
                <DialogDescription>Here you can update member hourly rate</DialogDescription>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ marginBottom: '16px' }}>
                        <InputField form={form} type="number" name="hourlyRate" label="hourlyRate" />

                        <Button disabled={form.formState.isSubmitting} type="submit">
                            Save
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
