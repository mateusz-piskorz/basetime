'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Nullable, TypedFieldPath } from '@/lib/types/common';
import { isNil } from 'lodash';
import { InputHTMLAttributes } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { Input } from '../../ui/input';

type FieldType = Nullable<string | number>;
type InputType = 'text' | 'number' | 'email' | 'tel' | 'password' | 'time';

type Props<T extends FieldValues, IT extends InputType> = {
    type?: IT;
    form: UseFormReturn<T>;
    name: TypedFieldPath<T, IT extends 'number' ? Nullable<number> : Nullable<string>>;
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

export const InputField = <T extends FieldValues, IT extends InputType>({
    onFocus,
    form,
    label,
    name: propsName,
    type,
    inputMode,
    className,
    classNameInput,
    placeholder,
    errorMessage = true,
    disabled,
    onBlur,
}: Props<T, IT>) => {
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
                        <Input
                            disabled={disabled}
                            className={classNameInput}
                            onFocus={onFocus}
                            placeholder={placeholder}
                            {...field}
                            value={isNil(field.value) ? '' : field.value}
                            type={type}
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
