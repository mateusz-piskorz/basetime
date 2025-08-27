'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Nullable, TypedFieldPath } from '@/lib/types/common';
import { cn } from '@/lib/utils';
import { InputHTMLAttributes } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { Input } from '../../ui/input';

type FieldType = Nullable<string | number>;
type InputType = 'text' | 'number' | 'email' | 'tel' | 'password';

type Props<T extends FieldValues, IT extends InputType> = {
    type?: IT;
    form: UseFormReturn<T>;
    name: TypedFieldPath<T, IT extends 'number' ? Nullable<number> : Nullable<string>>;
    label: string;
    inputMode?: InputHTMLAttributes<''>['inputMode'];
    className?: React.HTMLAttributes<'div'>['className'];
    onFocus?: () => void;
    errorMessage?: boolean;
    placeholder?: string;
};

export const InputField = <T extends FieldValues, IT extends InputType>({
    onFocus,
    form,
    label,
    name: propsName,
    type,
    inputMode,
    className,
    placeholder,
    errorMessage = true,
}: Props<T, IT>) => {
    const name = propsName as string;
    const { control } = form as unknown as UseFormReturn<{ [x: string]: FieldType }>;

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn(className)}>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input
                            onFocus={onFocus}
                            placeholder={placeholder || label}
                            {...field}
                            value={field.value || ''}
                            type={type}
                            inputMode={inputMode}
                        />
                    </FormControl>
                    {errorMessage && <FormMessage />}
                </FormItem>
            )}
        />
    );
};
