import { InputField } from '@/components/common/form-fields/input-field';
import { SelectField } from '@/components/common/form-fields/select-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useMember } from '@/lib/hooks/use-member';
import { createProject } from '@/lib/server-actions/project';
import { trpc } from '@/lib/trpc/client';
import { createProjectSchema } from '@/lib/zod/project-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { PROJECT_COLOR } from '@prisma/client';
import durationParser from 'parse-duration';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
};

export const CreateProjectDialog = ({ open, setOpen }: Props) => {
    const [error, setError] = useState<string | null>(null);

    const { organizationId } = useMember();
    const trpcUtils = trpc.useUtils();

    // const members = trpc.getMembers.useQuery({ organizationId });

    const form = useForm({
        resolver: zodResolver(createProjectSchema),
    });

    const onSubmit = async (data: z.infer<typeof createProjectSchema>) => {
        const res = await createProject({ data: { ...data, estimatedMinutes: durationParser(data.estimatedDuration, 'm') }, organizationId });
        if (!res.success) {
            toast.error(res.message);
            setError(res.message || null);
            return;
        }
        toast.success('Invitation sent successfully');
        trpcUtils.getProjects.refetch();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogTitle>Create project</DialogTitle>
                <DialogDescription>Here you can create a project</DialogDescription>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ marginBottom: '16px' }}>
                        <InputField form={form} type="text" name="name" label="organization name" placeholder="My organization 123" />
                        <InputField form={form} type="text" name="estimatedDuration" label="Duration" placeholder="2h 30min" />
                        <SelectField
                            form={form}
                            name="color"
                            label="Color"
                            selectOptions={Object.values(PROJECT_COLOR).map((e) => ({ label: e, value: e }))}
                        />

                        <p className="text-muted-foreground">member ids goes here</p>
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
