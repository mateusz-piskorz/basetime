import { InputField } from '@/components/common/form-fields/input-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { upsertOrganization } from '@/lib/server-actions/organization';
import { trpc } from '@/lib/trpc/client';
import { upsertOrganizationSchema } from '@/lib/zod/organization-schema';
import { zodResolver } from '@hookform/resolvers/zod';
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

        setOpen(false);
        router.push(`/dashboard/${res.data?.id}/overview`);
        toast.success('Organization created successfully');
        trpcUtils.getUserOrganizations.refetch();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogTitle>Create organization</DialogTitle>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ marginBottom: '16px' }}>
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
