'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { Nullable, TypedFieldPath } from '@/lib/types/common';
import { cn } from '@/lib/utils/common';

import { FieldValues, UseFormReturn } from 'react-hook-form';

type FieldType = Nullable<string>;

type Props<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: TypedFieldPath<T, FieldType>;
    className?: React.HTMLAttributes<'div'>['className'];
    textClassName?: string;
    label?: string;
    placeholder?: string;
    errorMessage?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'default' | 'lg';
};

export const SelectKanbanColumnStatusField = <T extends FieldValues>({
    form,
    className,
    textClassName,
    label,
    name: propsName,
    placeholder,
    disabled,
    size,
    errorMessage = true,
}: Props<T>) => {
    const name = propsName as string;
    const { control } = form as unknown as UseFormReturn<{ [x: string]: FieldType }>;

    const { orgId } = useMember();
    const { data } = trpc.kanbanColumns.useQuery({ orgId });

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    <Select onValueChange={(val) => val && field.onChange(val)} value={field.value || ''} disabled={disabled}>
                        <FormControl>
                            <SelectTrigger size={size} className="w-full">
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {(data || []).map(({ id, name, color }) => (
                                <SelectItem key={id} value={id}>
                                    <span className="h-2 min-w-2 rounded-full" style={{ backgroundColor: color }} />
                                    <span className={cn('max-w-[100px] truncate', textClassName)}>{name}</span>
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
