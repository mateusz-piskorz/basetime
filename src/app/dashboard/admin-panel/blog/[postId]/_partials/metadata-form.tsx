/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { InputField } from '@/components/common/form-fields/input-field';
import { InputFieldTags } from '@/components/common/form-fields/input-tags-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { updateBlogPost } from '@/lib/server-actions/blog-post';
import { updateBlogPostSchema } from '@/lib/zod/blog-post-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { BlogPost } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

type Props = {
    post: BlogPost;
};

export const MetadataForm = ({ post }: Props) => {
    const form = useForm({ resolver: zodResolver(updateBlogPostSchema), defaultValues: { ...post } });

    const onSubmit = async ({ content, ...rest }: z.infer<typeof updateBlogPostSchema>) => {
        const res = await updateBlogPost({ ...rest, oldSlug: post.slug });

        if (!res.success) {
            toast.error(res.message);
            return;
        }

        toast.success('Post metadata updated successfully');
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" style={{ marginBottom: '16px' }}>
                <div className="flex flex-wrap gap-8">
                    <InputField form={form} type="text" name="title" label="Title" placeholder="post-slug" />
                    <InputField form={form} type="text" name="slug" label="Slug" placeholder="title" />
                    <InputField form={form} type="text" name="ogImageUrl" label="ogImageUrl" placeholder="https://minio.basetime.online/..." />
                    <InputField form={form} type="text" name="readTime" label="readTime" placeholder="13min read" />

                    <InputFieldTags form={form} name="tags" label="tags" />
                </div>

                <Button disabled={form.formState.isSubmitting} type="submit">
                    Save metadata
                </Button>
            </form>
        </Form>
    );
};
