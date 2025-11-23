import React from 'react';
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { InputField } from '@/components/common/form-fields/input-field';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { createBlogPost } from '@/lib/server-actions/blog-post-admin';
import { createBlogPostSchema } from '@/lib/zod/blog-post-admin-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
};

export const CreateNewPostDialog = ({ open, setOpen }: Props) => {
    const router = useRouter();
    const form = useForm({ resolver: zodResolver(createBlogPostSchema) });

    const onSubmit = async ({ slug }: z.infer<typeof createBlogPostSchema>) => {
        const res = await createBlogPost({ slug });

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        toast.success('Post created successfully');
        router.push(`/dashboard/admin-panel/blog/${res.post?.id}`);
        setOpen(false);
    };

    React.useEffect(() => {
        if (form.formState.isSubmitSuccessful) form.reset({ slug: '' });
    }, [form.formState.isSubmitSuccessful]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogTitle>Create new post</DialogTitle>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ marginBottom: '16px' }}>
                        <InputField form={form} type="text" name="slug" label="Slug" placeholder="post-slug" />

                        <Button disabled={form.formState.isSubmitting} type="submit">
                            Create
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
