'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { InputField } from '@/components/common/form-fields/input-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { updatePassword } from '@/lib/server-actions/profile';
import { updatePasswordSchema } from '@/lib/zod/profile-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { toast } from 'sonner';
import z from 'zod';

export const SectionPassword = () => {
    const [error, setError] = useState<undefined | string>(undefined);
    const form = useForm({
        resolver: zodResolver(updatePasswordSchema),
    });

    const onSubmit = async (data: z.infer<typeof updatePasswordSchema>) => {
        const res = await updatePassword(data);

        if (!res.success) {
            toast.error(res.message);
            setError(res.message);
            return;
        }
        setError(undefined);
        toast.success('Password updated successfully');
        form.reset();
    };

    return (
        <div className="space-y-8 px-4 md:px-8">
            <DashboardHeading
                className="mb-8"
                title="Update password"
                description="Ensure your account is using a long, random password to stay secure"
            />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ marginBottom: '16px' }}>
                    <InputField form={form} type="password" name="current_password" label="Current Password" />
                    <InputField form={form} type="password" name="password" label="New Password" />
                    <InputField form={form} type="password" name="password_confirmation" label="Password Confirmation" />
                    {error && <p className="text-red-500">{error}</p>}
                    <Button disabled={form.formState.isSubmitting} type="submit">
                        Save
                    </Button>
                </form>
            </Form>
        </div>
    );
};
