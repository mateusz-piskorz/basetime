'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    projectId?: string;
};

export const SelectTaskField = <T extends FieldValues>({
    form,
    className,
    textClassName,
    label,
    name: propsName,
    placeholder,
    disabled,
    size,
    projectId,
    errorMessage = true,
}: Props<T>) => {
    const name = propsName as string;
    const { control } = form as unknown as UseFormReturn<{ [x: string]: FieldType }>;

    const { orgId, member } = useMember();
    const { data } = trpc.tasks.useQuery({ orgId, projectId: projectId!, assignedMember: member.id }, { enabled: Boolean(projectId) });

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    <Select onValueChange={field.onChange} value={field.value || 'no-task'} disabled={disabled}>
                        <FormControl>
                            <SelectTrigger size={size} className={cn('w-full', size === 'sm' && 'text-[13px]')}>
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="no-task">No Task</SelectItem>
                            <SelectGroup>
                                <SelectLabel>Tasks</SelectLabel>
                                {data?.map(({ id, name }) => (
                                    <SelectItem key={id} value={id}>
                                        <span className={cn('max-w-[100px] truncate', size === 'sm' && 'max-w-[80px]', textClassName)}>{name}</span>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {errorMessage && <FormMessage />}
                </FormItem>
            )}
        />
    );
};
