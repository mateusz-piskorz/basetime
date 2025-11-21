'use client';

import { TextareaField } from '@/components/common/form-fields/textarea-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { updateTask } from '@/lib/server-actions/task';
import { trpc, TrpcRouterOutput } from '@/lib/trpc/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { PenSquare } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type Props = {
    task: NonNullable<TrpcRouterOutput['task']>;
};

const schema = z.object({ description: z.string().nonempty() });

export const DescriptionForm = ({ task }: Props) => {
    const taskId = task.id;
    const defaultValues = { description: task.description || '' };
    const [editing, setEditing] = useState(false);
    const trpcUtils = trpc.useUtils();

    const form = useForm({ resolver: zodResolver(schema), defaultValues });

    const onSubmit = async ({ description }: z.infer<typeof schema>) => {
        const res = await updateTask({ taskId, description });
        if (!res.success) {
            toast.error(res.message);
            return;
        }
        form.reset({ description });
        trpcUtils.task.refetch({ taskId });
        setEditing(false);
    };

    return (
        <div className="px-4 text-sm">
            <div className="relative flex items-center">
                <h3 className="font-bold">Description</h3>
                <Button variant="ghost" onClick={() => setEditing(true)}>
                    <span className="sr-only">edit description</span>
                    <PenSquare className="size-4" />
                </Button>
            </div>
            {editing ? (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 text-sm">
                        <div className="dark:bg-input/30 rounded-md border">
                            <TextareaField
                                autoFocus
                                form={form}
                                name="description"
                                classNameInput="border-none shadow-none max-h-[150px] resize-none dark:bg-transparent"
                            />

                            <div className="flex justify-end gap-2 p-4">
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setEditing(false);
                                        form.reset(defaultValues);
                                    }}
                                    variant="link"
                                >
                                    Cancel
                                </Button>
                                <Button disabled={!form.formState.isDirty || form.formState.isSubmitting} type="submit" variant="secondary">
                                    Save Description
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            ) : (
                <p>{task.description || 'No Description'}</p>
            )}
        </div>
    );
};
