import { InputField } from '@/components/common/form-fields/input-field';
import { SelectField } from '@/components/common/form-fields/select-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { upsertOrganization } from '@/lib/server-actions/organization';
import { trpc } from '@/lib/trpc/client';
import { upsertOrganizationSchema } from '@/lib/zod/organization-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { CURRENCY } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
};

export const CreateOrganizationDialog = ({ open, setOpen }: Props) => {
    const trpcUtils = trpc.useUtils();
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(upsertOrganizationSchema),
    });

    const onSubmit = async (data: z.infer<typeof upsertOrganizationSchema>) => {
        const res = await upsertOrganization({ ...data });

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        toast.success('Organization created successfully');
        trpcUtils.getUserOrganizations.refetch();
        router.push(`/dashboard/${res.data?.id}/overview`);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogTitle></DialogTitle>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ marginBottom: '16px' }}>
                        <SelectField
                            form={form}
                            label="Currency"
                            name="currency"
                            selectOptions={Object.values(CURRENCY).map((e) => ({
                                label: e,
                                value: e,
                            }))}
                        />
                        <InputField form={form} name="name" label="Name" />

                        <Button disabled={form.formState.isSubmitting} type="submit">
                            Create organization
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
