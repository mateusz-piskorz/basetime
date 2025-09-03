import { InputField } from '@/components/common/form-fields/input-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useMember } from '@/lib/hooks/use-member';
import { createInvitation } from '@/lib/server-actions/invitation';
import { trpc } from '@/lib/trpc/client';
import { createInvitationSchema } from '@/lib/zod/invitation-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
};

export const CreateInvitationDialog = ({ open, setOpen }: Props) => {
    const [error, setError] = useState<string | null>(null);
    const { organizationId } = useMember();

    const trpcUtils = trpc.useUtils();

    const form = useForm({
        resolver: zodResolver(createInvitationSchema),
    });

    const onSubmit = async (data: z.infer<typeof createInvitationSchema>) => {
        const res = await createInvitation({ data, organizationId });

        if (!res.success) {
            toast.error(res.message);
            setError(res.message || null);
            return;
        }

        toast.success('Invitation sent successfully');
        trpcUtils.getOrganizationInvitations.refetch();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogTitle>Send invitation</DialogTitle>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ marginBottom: '16px' }}>
                        <InputField form={form} type="text" name="email" label="Email" placeholder="JohnDoe@yahoo.com" />
                        {error && <p className="text-red-500">{error}</p>}
                        <Button disabled={form.formState.isSubmitting} type="submit">
                            Send
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
