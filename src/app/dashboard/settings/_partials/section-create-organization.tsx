'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { InputField } from '@/components/common/form-fields/input-field';
import { SelectField } from '@/components/common/form-fields/select-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { upsertOrganization } from '@/lib/server-actions/organization';
import { trpc } from '@/lib/trpc/client';
import { upsertOrganizationSchema } from '@/lib/zod/organization-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { CURRENCY } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export const SectionUpsertOrganization = () => {
    const trpcUtils = trpc.useUtils();

    const form = useForm({
        resolver: zodResolver(upsertOrganizationSchema),
    });

    const onSubmit = async (data: z.infer<typeof upsertOrganizationSchema>) => {
        const res = await upsertOrganization({ data });

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        toast.success('Organization created successfully');
        trpcUtils.getUserOrganizations.refetch();
    };

    return (
        <div className="space-y-8 px-4 md:px-8">
            <DashboardHeading className="mb-8" title="Create organization" description="create new organization" />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ marginBottom: '16px' }}>
                    <InputField form={form} type="text" name="name" label="Name" className="max-w-[300px]" />
                    <SelectField
                        placeholder="Currency"
                        form={form}
                        name="currency"
                        label="Currency"
                        selectOptions={Object.values(CURRENCY).map((e) => ({ label: e, value: e }))}
                    />

                    <Button disabled={form.formState.isSubmitting} type="submit">
                        Create
                    </Button>
                </form>
            </Form>
        </div>
    );
};
