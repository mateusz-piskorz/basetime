'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projectColor } from '@/lib/constants/project-color';
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

export const SelectProjectField = <T extends FieldValues>({
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

    const { member, organizationId } = useMember();
    const { data } = trpc.getMemberProjects.useQuery({ organizationId, memberId: member.id });

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
                            <SelectItem value="no-project">No Project</SelectItem>
                            <SelectGroup>
                                <SelectLabel>Projects</SelectLabel>
                                {(data ? data : []).map(({ id, name, color }) => (
                                    <SelectItem key={id} value={id}>
                                        <span className="h-2 min-w-2 rounded-full" style={{ backgroundColor: projectColor[color] }} />
                                        <span className={cn('max-w-[100px] truncate', textClassName)}>{name}</span>
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
