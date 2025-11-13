/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import ConfirmDialog from '@/components/common/confirm-dialog';
import { HexPickerField } from '@/components/common/form-fields/hex-picker-field';
import { InputField } from '@/components/common/form-fields/input-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useMember } from '@/lib/hooks/use-member';
import { createKanbanColumn, deleteKanbanColumn, updateKanbanColumn } from '@/lib/server-actions/kanban-column';
import { trpc, TrpcRouterOutput } from '@/lib/trpc/client';
import { upsertKanbanColumnSchema } from '@/lib/zod/kanban-column-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
    selectedColumn?: NonNullable<TrpcRouterOutput['kanbanColumns']>[number];
    onSuccess?: () => void;
};

export const UpsertColumnDialog = ({ open, setOpen, selectedColumn, onSuccess }: Props) => {
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const trpcUtils = trpc.useUtils();
    const { orgId } = useMember();
    const form = useForm<z.infer<typeof upsertKanbanColumnSchema>>({ resolver: zodResolver(upsertKanbanColumnSchema) });

    useEffect(() => {
        const st = selectedColumn;
        form.reset(
            st
                ? {
                      name: st.name,
                      color: st.color,
                      order: String(st.order),
                  }
                : undefined,
        );
    }, [selectedColumn, form.formState.isSubmitSuccessful]);

    async function onSubmit({ name, color, order }: z.infer<typeof upsertKanbanColumnSchema>) {
        let res;
        if (selectedColumn) {
            res = await updateKanbanColumn({
                name,
                columnId: selectedColumn.id,
                color,
                order: Number(order),
            });
        } else {
            res = await createKanbanColumn({
                name,
                orgId,
                color,
                order: Number(order),
            });
        }

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        trpcUtils.kanbanColumns.refetch();
        toast.success(`Column ${selectedColumn ? 'Updated' : 'Created'} successfully`);
        onSuccess?.();
        setOpen(false);
    }

    return (
        <>
            {Boolean(selectedColumn) && (
                <ConfirmDialog
                    open={confirmOpen}
                    setOpen={setConfirmOpen}
                    onContinue={async () => {
                        const res = await deleteKanbanColumn({ columnId: selectedColumn!.id });
                        if (res.success) {
                            toast.success('column deleted successfully');
                            trpcUtils.kanbanColumns.refetch();
                            setOpen(false);
                            return;
                        }
                        toast.error(res.message || 'something went wrong - deleteKanbanColumn');
                    }}
                    title="Do you really want to remove column?"
                    description="This action cannot be undone. Column will be removed permanently, tasks will be moved to status unknown"
                />
            )}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedColumn ? 'Update' : 'Create'} Column</DialogTitle>
                        <DialogDescription>Fill in the details below to {selectedColumn ? 'Update' : 'Create'} Column</DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form
                            onSubmit={(event) => {
                                event.stopPropagation();
                                form.handleSubmit(onSubmit)(event);
                            }}
                            className="flex flex-col gap-y-6"
                        >
                            <InputField form={form} name="name" label="Name" />

                            <HexPickerField className="justify-start" form={form} name="color" label="Color" />

                            <InputField form={form} name="order" label="Order" />

                            <Button type="submit" className="w-full sm:w-auto" size="lg">
                                Submit
                            </Button>
                        </form>
                    </Form>
                    {/* todo: minor */}
                    {/* looks cool, extract to separate component, check other places where we use it */}
                    {Boolean(selectedColumn) && (
                        <div className="space-y-4 rounded-lg border border-red-200 bg-red-100 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                            <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                                <p className="font-medium">Warning</p>
                                <p className="text-sm">Please proceed with caution, this cannot be undone.</p>
                                <Button className="mt-3" variant="destructive" onClick={() => setConfirmOpen(true)}>
                                    Delete column
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};
