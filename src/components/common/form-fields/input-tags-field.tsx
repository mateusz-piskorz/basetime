'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Nullable, TypedFieldPath } from '@/lib/types/common';
import { InputHTMLAttributes } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { InputTags } from '../../ui/input-tags';

type FieldType = Nullable<string[]>;

type Props<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: TypedFieldPath<T, FieldType>;
    label?: string;
    inputMode?: InputHTMLAttributes<''>['inputMode'];
    className?: React.HTMLAttributes<'div'>['className'];
    classNameInput?: React.HTMLAttributes<'input'>['className'];
    onFocus?: () => void;
    errorMessage?: boolean;
    placeholder?: string;
    disabled?: boolean;
    onBlur?: (val: string) => void;
};

export const InputFieldTags = <T extends FieldValues>({
    onFocus,
    form,
    label,
    name: propsName,
    inputMode,
    className,
    classNameInput,
    placeholder,
    errorMessage = true,
    disabled,
    onBlur,
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
                        <InputTags
                            {...field}
                            disabled={disabled}
                            className={classNameInput}
                            onFocus={onFocus}
                            placeholder={placeholder}
                            value={field.value || []}
                            onChange={field.onChange}
                            inputMode={inputMode}
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
