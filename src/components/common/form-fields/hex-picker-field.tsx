'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TypedFieldPath } from '@/lib/types/common';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { HexPicker } from '../hex-picker';

type Props<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: TypedFieldPath<T, string>;
    label?: string;
    className?: React.HTMLAttributes<'div'>['className'];
    errorMessage?: boolean;
};

export const HexPickerField = <T extends FieldValues>({ form, label, name: propsName, className, errorMessage = true }: Props<T>) => {
    const name = propsName as string;
    const { control } = form as unknown as UseFormReturn<{ [x: string]: string }>;

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                return (
                    <FormItem className={className}>
                        {label && <FormLabel>{label}</FormLabel>}
                        <FormControl>
                            <HexPicker onChange={(color) => field.onChange(color)} value={field.value || '#B96D40'} />
                        </FormControl>
                        {errorMessage && <FormMessage />}
                    </FormItem>
                );
            }}
        />
    );
};
