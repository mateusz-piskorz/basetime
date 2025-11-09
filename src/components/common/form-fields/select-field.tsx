'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Nullable, TypedFieldPath } from '@/lib/types/common';

import { FieldValues, UseFormReturn } from 'react-hook-form';

type FieldType = Nullable<string>;

type Props<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: TypedFieldPath<T, FieldType>;
    className?: React.HTMLAttributes<'div'>['className'];
    selectOptions: { label: string; value: string; disabled?: boolean }[];
    label?: string;
    placeholder?: string;
    errorMessage?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'default' | 'lg';
    nullOption?: string;
};

export const SelectField = <T extends FieldValues>({
    form,
    className,
    selectOptions,
    label,
    name: propsName,
    placeholder,
    disabled,
    size,
    errorMessage = true,
    nullOption,
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
                    <Select onValueChange={field.onChange} value={field.value || ''} disabled={disabled}>
                        <FormControl>
                            <SelectTrigger size={size} className="w-full">
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {nullOption && <SelectItem value={'null'}>{nullOption}</SelectItem>}
                            {selectOptions.map(({ label, value, disabled }) => (
                                <SelectItem disabled={disabled} key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {errorMessage && <FormMessage />}
                </FormItem>
            )}
        />
    );
};
