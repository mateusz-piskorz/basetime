'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Nullable, TypedFieldPath } from '@/lib/types/common';
import { FieldValues, UseFormReturn } from 'react-hook-form';

type FieldType = Nullable<string>;

type Props<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: TypedFieldPath<T, FieldType>;
    label?: string;
    className?: React.HTMLAttributes<'div'>['className'];
    classNameInput?: React.HTMLAttributes<'input'>['className'];
    onFocus?: () => void;
    errorMessage?: boolean;
    placeholder?: string;
    disabled?: boolean;
    onBlur?: (val: string) => void;
    autoFocus?: boolean;
};

export const TextareaField = <T extends FieldValues>({
    onFocus,
    form,
    label,
    name: propsName,
    className,
    classNameInput,
    placeholder,
    errorMessage = true,
    disabled,
    onBlur,
    autoFocus,
}: Props<T>) => {
    const name = propsName as string;
    const { control } = form as unknown as UseFormReturn<{ [x: string]: FieldType }>;

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    <FormControl>
                        <Textarea
                            autoFocus={autoFocus}
                            {...field}
                            disabled={disabled}
                            className={classNameInput}
                            onFocus={onFocus}
                            placeholder={placeholder}
                            value={field.value || []}
                            onChange={field.onChange}
                            onBlur={(e) => {
                                field.onBlur();
                                onBlur?.(e.target.value);
                            }}
                        />
                    </FormControl>
                    {errorMessage && <FormMessage />}
                </FormItem>
            )}
        />
    );
};
