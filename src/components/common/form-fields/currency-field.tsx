import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { Nullable, TypedFieldPath } from '@/lib/types/common';
import { CURRENCY } from '@prisma/client';
import { useEffect, useReducer } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { Input } from '../../ui/input';

type FieldType = Nullable<number>;

type Props<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: TypedFieldPath<T, FieldType>;
    label: string;
    className?: React.HTMLAttributes<'div'>['className'];
    errorMessage?: boolean;
    placeholder?: string;
    currency: CURRENCY;
};

export const CurrencyField = <T extends FieldValues>({
    form,
    label,
    name: propsName,
    className,
    placeholder,
    currency,
    errorMessage = true,
}: Props<T>) => {
    const moneyFormatter = Intl.NumberFormat('en', {
        currency: currency,
        currencyDisplay: 'code',
        style: 'currency',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const name = propsName as string;
    const { control, getValues, watch } = form as unknown as UseFormReturn<{ [x: string]: FieldType }>;

    const initialValue = getValues(name) ? moneyFormatter.format(getValues(name) || 0) : 0;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const [value, setValue] = useReducer((_: any, next: string) => {
        const digits = next.replace(/\D/g, '');
        return moneyFormatter.format(Number(digits) / 100);
    }, initialValue);

    function handleChange(realChangeFn: (val: number) => void, formattedValue: string) {
        const digits = formattedValue.replace(/\D/g, '');
        const realValue = Number(digits) / 100;
        realChangeFn(realValue);
    }

    const valueW = watch(name);

    useEffect(() => {
        const watchedValue = valueW;
        if (watchedValue !== undefined && watchedValue !== null) {
            setValue(moneyFormatter.format(Number(watchedValue)));
        } else {
            setValue('');
        }
    }, [valueW]);

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                field.value = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value;

                const _change = field.onChange;
                return (
                    <FormItem className={className}>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                inputMode="numeric"
                                placeholder={placeholder || label}
                                {...field}
                                value={value}
                                onChange={(ev) => {
                                    setValue(ev.target.value);
                                    handleChange(_change, ev.target.value);
                                }}
                            />
                        </FormControl>
                        {errorMessage && <FormMessage />}
                    </FormItem>
                );
            }}
        />
    );
};
