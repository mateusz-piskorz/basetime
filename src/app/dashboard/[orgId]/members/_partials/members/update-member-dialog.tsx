import { CurrencyField } from '@/components/common/form-fields/currency-field';
import { MultiSelectField } from '@/components/common/form-fields/multi-select-field';
import { SelectField } from '@/components/common/form-fields/select-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { projectColor } from '@/lib/constants/project-color';
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
    member: NonNullable<TrpcRouterOutput['members']>[number];
};

export const UpdateMemberDialog = ({ open, setOpen, onSuccess, member }: Props) => {
    const { currency } = useMember();
    const trpcUtils = trpc.useUtils();
    const { orgId } = useMember();
    const { data: projects } = trpc.projects.useQuery({ orgId });

    const form = useForm({
        resolver: zodResolver(updateMemberSchema),
    });

    useEffect(() => {
        form.reset({ projectIds: member.Projects.map((e) => e.id), role: member.role, hourlyRate: member.hourlyRate });
    }, [form, form.formState.isSubmitSuccessful, member]);

    const onSubmit = async (data: z.infer<typeof updateMemberSchema>) => {
        const res = await updateMember({ ...data, memberId: member.id });

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        toast.success('Member updated successfully');
        trpcUtils.members.refetch();
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
                            selectOptions={Object.values(MEMBER_ROLE).map((e) => ({
                                label: e,
                                value: e,
                                disabled: (member.role === 'OWNER' && e !== 'OWNER') || (member.role !== 'OWNER' && e == 'OWNER'),
                            }))}
                        />
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <CurrencyField currency={currency} form={form} label="Hourly Rate" name="hourlyRate" className="min-w-[150px] flex-1" />

                            <MultiSelectField
                                className="flex-1"
                                form={form}
                                name="projectIds"
                                options={(projects || []).map(({ name, id, color }) => ({
                                    label: (
                                        <>
                                            <span className="max-w-[100px] truncate">{name}</span>
                                            <span className="h-2 min-w-2 rounded-full" style={{ backgroundColor: projectColor[color] }} />
                                        </>
                                    ),
                                    value: id,
                                }))}
                                label="Projects"
                            />
                        </div>

                        <Button disabled={form.formState.isSubmitting} type="submit">
                            Save
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
