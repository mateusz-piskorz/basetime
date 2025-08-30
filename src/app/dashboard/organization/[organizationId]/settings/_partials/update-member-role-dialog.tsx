import { SelectField } from '@/components/common/form-fields/select-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { updateRole } from '@/lib/server-actions/member';
import { trpc } from '@/lib/trpc/client';
import { updateRoleSchema } from '@/lib/zod/member-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { MEMBER_ROLE } from '@prisma/client';
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
    defaultValues: z.infer<typeof updateRoleSchema>;
};

export const UpdateMemberRoleDialog = ({ open, setOpen, onSuccess, userName, memberId, defaultValues }: Props) => {
    const trpcUtils = trpc.useUtils();
    const form = useForm({
        resolver: zodResolver(updateRoleSchema),
        defaultValues,
    });

    useEffect(() => {
        form.reset();
    }, [form, form.formState.isSubmitSuccessful]);

    const onSubmit = async (data: z.infer<typeof updateRoleSchema>) => {
        const res = await updateRole({ data, memberId });

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        toast.success('Member role updated successfully');
        trpcUtils.getMembers.refetch();
        onSuccess();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogTitle>Preview and manage {userName}</DialogTitle>
                <DialogDescription>Here you can update member role</DialogDescription>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ marginBottom: '16px' }}>
                        <SelectField
                            form={form}
                            label="role"
                            name="role"
                            selectOptions={Object.values(MEMBER_ROLE).map((e) => ({ label: e, value: e }))}
                        />

                        <Button disabled={form.formState.isSubmitting} type="submit">
                            Save
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
