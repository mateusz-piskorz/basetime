import { DurationField } from '@/components/common/form-fields/duration-field';
import { InputField } from '@/components/common/form-fields/input-field';
import { MultiSelectField } from '@/components/common/form-fields/multi-select-field';
import { SelectField } from '@/components/common/form-fields/select-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useMember } from '@/lib/hooks/use-member';
import { upsertProject } from '@/lib/server-actions/project';
import { trpc, TrpcRouterOutput } from '@/lib/trpc/client';
import { formatMinutes } from '@/lib/utils/common';
import { upsertProjectSchema } from '@/lib/zod/project-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { PROJECT_COLOR } from '@prisma/client';
import durationParser from 'parse-duration';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
    project?: NonNullable<TrpcRouterOutput['projects']>[number];
};

export const UpsertProjectDialog = ({ open, setOpen, project }: Props) => {
    const { organizationId } = useMember();
    const trpcUtils = trpc.useUtils();

    const form = useForm({
        resolver: zodResolver(upsertProjectSchema),
    });

    useEffect(() => {
        form.reset({
            memberIds: project?.Members.map((e) => e.id),
            color: project?.color,
            estimatedDuration: project?.estimatedMinutes ? formatMinutes(project.estimatedMinutes) : undefined,
            name: project?.name,
        });
    }, [form, form.formState.isSubmitSuccessful, project]);

    const onSubmit = async (data: z.infer<typeof upsertProjectSchema>) => {
        const res = await upsertProject({
            ...data,
            estimatedMinutes: durationParser(data.estimatedDuration, 'm'),
            organizationId,
            projectId: project?.id,
        });
        if (!res.success) {
            toast.error(res.message);

            return;
        }
        toast.success(`Project ${project ? 'updated' : 'created'} successfully`);
        trpcUtils.projects.refetch();
        setOpen(false);
    };
    const { data: members } = trpc.members.useQuery({ organizationId });

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogTitle>{project ? `Update ${project.name}` : 'Create project'}</DialogTitle>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ marginBottom: '16px' }}>
                        <InputField form={form} type="text" name="name" label="Project Name" placeholder="New Project" />

                        <div className="flex flex-col gap-6 sm:flex-row-reverse sm:items-end sm:gap-4">
                            <MultiSelectField
                                className="flex-1"
                                form={form}
                                name="memberIds"
                                options={(members || []).map(({ id, User: { email } }) => ({ label: email, value: id }))}
                                label="Members"
                            />
                            <DurationField form={form} name="estimatedDuration" label="Estimated Duration" />
                        </div>
                        <p className="text-muted-foreground -mt-4 text-sm">you can type human language here e.g. 2h 30m</p>

                        <SelectField
                            form={form}
                            name="color"
                            label="Color"
                            selectOptions={Object.values(PROJECT_COLOR).map((e) => ({ label: e, value: e }))}
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
