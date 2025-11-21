'use client';

import { cn } from '@/lib/utils/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { Button } from '../ui/button';
import { Form } from '../ui/form';
import { TextareaField } from './form-fields/textarea-field';

const schema = z.object({ content: z.string().nonempty() });
type Props = {
    onSubmit: (arg: { content: string; formReset: (arg: z.infer<typeof schema>) => void }) => Promise<void>;
    onCancel?: () => void;
    initContent?: string;
    className?: string;
    autoFocus?: boolean;
};

export const CommentForm = ({ onSubmit, initContent, className, autoFocus, onCancel }: Props) => {
    const form = useForm({ resolver: zodResolver(schema), defaultValues: { content: initContent || '' } });

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(({ content }) => onSubmit({ content, formReset: form.reset }))}
                className={cn('mb-6 space-y-8', className)}
            >
                <div className="dark:bg-input/30 rounded-md border">
                    <TextareaField
                        autoFocus={autoFocus}
                        form={form}
                        name="content"
                        placeholder="What are your thoughts?"
                        classNameInput="border-none shadow-none max-h-[150px] resize-none dark:bg-transparent"
                    />

                    <div className="flex justify-end gap-2 p-4">
                        <Button
                            type="button"
                            onClick={() => {
                                form.reset({ content: initContent });
                                onCancel?.();
                            }}
                            variant="link"
                        >
                            Cancel
                        </Button>
                        <Button disabled={form.formState.isSubmitting} type="submit" variant="secondary">
                            {initContent ? 'Save' : 'Respond'}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
};
