'use client';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { Nullable, TypedFieldPath } from '@/lib/types/common';
import { cn } from '@/lib/utils/common';

import { FieldValues, UseFormReturn } from 'react-hook-form';
import { ProjectBadge } from '../project-badge';

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

    const { orgId } = useMember();
    const { data } = trpc.projects.useQuery({ orgId });

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    <Select onValueChange={field.onChange} value={field.value || 'no-project'} disabled={disabled}>
                        <FormControl>
                            <SelectTrigger size={size} className={cn('w-full', size === 'sm' && 'text-[13px]')}>
                                <SelectValue placeholder={placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="no-project">No Project</SelectItem>
                            <SelectGroup>
                                <SelectLabel>Projects</SelectLabel>
                                {(data || []).map(({ id, shortName, color }) => (
                                    <SelectItem key={id} value={id}>
                                        <ProjectBadge className="border-none px-0" hex={color} name={shortName} />
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
