'use client';

import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projectColor } from '@/lib/constants/project-color';
import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';
import { Control } from 'react-hook-form';

type FormValues = {
    projectId?: string | null;
};

type Props = {
    control: Control<FormValues>;
    className?: string;
    size?: 'default' | 'lg' | 'sm';
    disabled?: boolean;
};

export const SelectProject = ({ control, className, size, disabled }: Props) => {
    const { id, organizationId } = useMember().member;

    const { data, isLoading, isError } = trpc.getMemberProjects.useQuery({ organizationId, memberId: id });

    return (
        <FormField
            control={control}
            name="projectId"
            render={({ field }) => (
                <FormItem className={cn('rounded', className)}>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl>
                            <SelectTrigger size={size} className="w-full" disabled={disabled}>
                                <SelectValue />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="no-project">No Project</SelectItem>
                            <SelectGroup>
                                <SelectLabel>Projects</SelectLabel>
                                {(data ? data : []).map(({ id, name, color }) => (
                                    <SelectItem key={id} value={id}>
                                        <span className="h-2 min-w-2 rounded-full" style={{ backgroundColor: projectColor[color] }} />
                                        <span className="max-w-[100px] truncate">{name}</span>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
        />
    );
};
