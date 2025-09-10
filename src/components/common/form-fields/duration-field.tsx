import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Nullable, TypedFieldPath } from '@/lib/types/common';
import { formatMinutes } from '@/lib/utils/common';
import durationParser from 'parse-duration';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { Input } from '../../ui/input';

type FieldType = Nullable<string>;

type Props<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: TypedFieldPath<T, FieldType>;
    className?: React.HTMLAttributes<'div'>['className'];
    errorMessage?: boolean;
    placeholder?: string;
    onBlur?: (minutes: number) => void;
    label?: string;
};

export const DurationField = <T extends FieldValues>({
    form,
    label,
    name: propsName,
    className,
    placeholder,
    errorMessage = true,
    onBlur,
}: Props<T>) => {
    const name = propsName as string;
    const { control, setValue } = form as unknown as UseFormReturn<{ [x: string]: FieldType }>;

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                return (
                    <FormItem className={className}>
                        {label && <FormLabel>{label}</FormLabel>}
                        <FormControl>
                            <Input
                                type="text"
                                inputMode="numeric"
                                placeholder={placeholder}
                                {...field}
                                value={field.value || ''}
                                onBlur={(e) => {
                                    const minutes = durationParser(e.target.value, 'm');
                                    setValue(name, formatMinutes(minutes || 90));
                                    field.onBlur();
                                    onBlur?.(minutes || 90);
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
