import { CurrencyField } from '@/components/common/form-fields/currency-field';
import { MultiSelectField } from '@/components/common/form-fields/multi-select-field';
import { SelectField } from '@/components/common/form-fields/select-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useMember } from '@/lib/hooks/use-member';
import { updateMember } from '@/lib/server-actions/member';
import { trpc, TrpcRouterOutput } from '@/lib/trpc/client';
import { updateMemberSchema } from '@/lib/zod/member-schema';
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
    member: NonNullable<TrpcRouterOutput['getMembers']>[number];
};

export const UpdateMemberDialog = ({ open, setOpen, onSuccess, member }: Props) => {
    const { currency } = useMember();
    const trpcUtils = trpc.useUtils();
    const { organizationId } = useMember();
    const { data: projects } = trpc.getProjects.useQuery({ organizationId });
    const form = useForm({
        resolver: zodResolver(updateMemberSchema),
        defaultValues: { projectIds: member.Projects.map((e) => e.id) },
    });

    useEffect(() => {
        form.reset();
    }, [form, form.formState.isSubmitSuccessful]);

    const onSubmit = async (data: z.infer<typeof updateMemberSchema>) => {
        const res = await updateMember({ data, memberId: member.id });

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        toast.success('Member updated successfully');
        trpcUtils.getMembers.refetch();
        onSuccess();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogTitle>
                    {member.User.name} ({member.User.email})
                </DialogTitle>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ marginBottom: '16px' }}>
                        <SelectField
                            form={form}
                            label="Role"
                            name="role"
                            selectOptions={Object.values(MEMBER_ROLE).map((e) => ({ label: e, value: e }))}
                        />
                        <CurrencyField form={form} label={`Hourly Rate ${currency}`} name="hourlyRate" />
                        <MultiSelectField
                            form={form}
                            name="projectIds"
                            options={(projects || []).map(({ name, id }) => ({ label: name, value: id }))}
                            label="Projects"
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
