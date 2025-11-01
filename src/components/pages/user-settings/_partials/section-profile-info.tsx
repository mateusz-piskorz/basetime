'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { InputField } from '@/components/common/form-fields/input-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useAuth } from '@/lib/hooks/use-auth';
import { updateProfile } from '@/lib/server-actions/profile';
import { updateProfileSchema } from '@/lib/zod/profile-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export const SectionProfileInfo = () => {
    const { user } = useAuth();
    const form = useForm({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: { name: user?.name || '' },
    });

    const onSubmit = async (data: z.infer<typeof updateProfileSchema>) => {
        const res = await updateProfile(data);

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        toast.success('Profile updated successfully');
    };

    return (
        <div className="space-y-8 px-4 md:px-8">
            <DashboardHeading title="Profile information" description="Update your name and profile image" />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ marginBottom: '16px' }}>
                    <InputField form={form} type="text" name="name" label="Name" />

                    <Button disabled={form.formState.isSubmitting} type="submit">
                        Save
                    </Button>
                </form>
            </Form>
        </div>
    );
};
