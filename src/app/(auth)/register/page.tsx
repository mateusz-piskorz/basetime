'use client';
import React from 'react';

import { InputField } from '@/components/common/form-fields/input-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { signup } from '@/lib/server-actions/auth';
import { registerSchema } from '@/lib/zod/auth-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export default function RegisterPage() {
    const [error, setError] = React.useState<string | undefined>(undefined);
    const router = useRouter();
    const form = useForm({ resolver: zodResolver(registerSchema) });

    const onSubmit = async (values: z.infer<typeof registerSchema>) => {
        const res = await signup(values);

        if (!res.success) {
            toast.error(res.message);
            setError(res.message);
            return;
        }

        setError(undefined);
        toast.success('registered successfully');
        form.reset();
        router.replace('/dashboard');
    };

    return (
        <>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-xl font-medium">Create an account</h1>
                <p className="text-muted-foreground text-sm text-balance">Enter your details below to create your account</p>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ marginBottom: '16px' }}>
                    <InputField form={form} type="email" name="email" label="Email" placeholder="JohnDoe@gmail.com" />
                    <InputField form={form} type="text" name="name" label="Name (Optional)" placeholder="John Doe" />
                    <InputField form={form} type="password" name="password" label="Password" placeholder="john1234" />
                    {error && <p className="text-red-500">{error}</p>}
                    <Button disabled={form.formState.isSubmitting} type="submit" className="w-full">
                        Register
                    </Button>
                    <p className="text-muted-foreground text-center">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
                            Log in
                        </Link>
                    </p>
                </form>
            </Form>
        </>
    );
}
