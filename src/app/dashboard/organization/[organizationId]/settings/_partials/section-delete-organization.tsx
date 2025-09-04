'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { InputField } from '@/components/common/form-fields/input-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useMember } from '@/lib/hooks/use-member';
import { deleteOrganization } from '@/lib/server-actions/organization';

import { deleteOrganizationSchema } from '@/lib/zod/organization-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export const SectionDeleteOrganization = () => {
    const { organizationId } = useMember();

    const router = useRouter();
    const [error, setError] = useState<undefined | string>(undefined);
    const form = useForm({
        resolver: zodResolver(deleteOrganizationSchema),
    });

    const onSubmit = async (data: z.infer<typeof deleteOrganizationSchema>) => {
        const res = await deleteOrganization({ data, organizationId });

        if (!res.success) {
            toast.error(res.message);
            setError(res.message);
            return;
        }

        toast.success('organization deleted successfully');
        router.replace('/dashboard');
    };

    return (
        <div className="space-y-8 px-4 md:px-8">
            <DashboardHeading className="mb-8" title="Delete organization" description="delete organization and all of its resources permanently" />
            <div className="space-y-4 rounded-lg border border-red-200 bg-red-100 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Warning</p>
                    <p className="text-sm">Please proceed with caution, this cannot be undone.</p>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive">Delete organization</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Are you sure you want to delete your organization?</DialogTitle>
                        <DialogDescription>
                            Once your organization is deleted, all of its resources and data will also be permanently deleted. Please enter your
                            password to confirm you would like to permanently delete your organization.
                        </DialogDescription>
                        <Form {...form}>
                            <form
                                className="space-y-6"
                                onSubmit={(event) => {
                                    event.stopPropagation();
                                    form.handleSubmit(onSubmit)(event);
                                }}
                            >
                                <InputField form={form} name="password" label="Password" type="password" />
                                {error && <p className="text-red-500">{error}</p>}
                                <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                        <Button variant="secondary">Cancel</Button>
                                    </DialogClose>

                                    <Button variant="destructive" disabled={form.formState.isSubmitting} type="submit">
                                        Delete account
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
