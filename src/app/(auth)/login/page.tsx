'use client';

import { InputField } from '@/components/common/form-fields/input-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { signin } from '@/lib/server-actions/auth';
import { loginSchema } from '@/lib/zod/auth-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export default function LoginPage() {
    const [error, setError] = useState<string | undefined>(undefined);
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        const res = await signin(values);

        if (!res.success) {
            toast.error(res.message);
            setError(res.message);
            return;
        }

        setError(undefined);
        toast.success('logged in successfully');
        form.reset();
        router.replace('/dashboard');
    };

    return (
        <>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-xl font-medium">Log in to your account</h1>
                <p className="text-muted-foreground text-sm text-balance">Enter your email and password below to log in</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ marginBottom: '16px' }}>
                    <InputField form={form} type="email" name="email" label="Email" />
                    <InputField form={form} type="password" name="password" label="Password" />
                    {error && <p className="text-red-500">{error}</p>}
                    <Button disabled={form.formState.isSubmitting} type="submit" className="w-full">
                        Login
                    </Button>
                </form>
            </Form>
        </>
    );
}
