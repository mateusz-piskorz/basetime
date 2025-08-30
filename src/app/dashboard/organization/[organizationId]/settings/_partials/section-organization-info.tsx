'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { InputField } from '@/components/common/form-fields/input-field';
import { SelectField } from '@/components/common/form-fields/select-field';
import { SpinLoader } from '@/components/common/spin-loader';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { upsertOrganization } from '@/lib/server-actions/organization';
import { trpc } from '@/lib/trpc/client';
import { upsertOrganizationSchema } from '@/lib/zod/organization-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { CURRENCY } from '@prisma/client';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export const SectionOrganizationInfo = () => {
    const { organizationId } = useParams<{ organizationId: string }>();

    const { data, isLoading, error } = trpc.getOrganization.useQuery({ organizationId });

    return (
        <div className="space-y-8 px-4 md:px-8">
            <DashboardHeading className="mb-8" title="Organization information" description="Update your organizations name and currency" />
            {error && <p className="text-red-500">dwa{error.message}</p>}
            {!error && isLoading && <SpinLoader />}

            {!error && !isLoading && data && <FormComponent organizationId={data.id} defaultValues={{ ...data }} />}
        </div>
    );
};

type Props = {
    organizationId: string;
    defaultValues: z.infer<typeof upsertOrganizationSchema>;
};

const FormComponent = ({ organizationId, defaultValues }: Props) => {
    const trpcUtils = trpc.useUtils();
    const onSubmit = async (data: z.infer<typeof upsertOrganizationSchema>) => {
        const res = await upsertOrganization({ data, organizationId });

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        toast.success('Organization updated successfully');
        trpcUtils.getUserOrganizations.refetch();
    };

    const form = useForm({
        resolver: zodResolver(upsertOrganizationSchema),
        defaultValues,
    });

    return (
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
                    Save
                </Button>
            </form>
        </Form>
    );
};
