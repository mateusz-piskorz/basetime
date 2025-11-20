'use client';

import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';

import { Nullable, TypedFieldPath } from '@/lib/types/common';
import { ComponentProps } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { SelectField } from '../select-field';

type Props<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: TypedFieldPath<T, Nullable<string>>;
    label?: string;
    className?: string;
    disabled?: boolean;
    size?: ComponentProps<typeof SelectField>['size'];
    nullOption?: boolean;
    projectId?: string;
};

export const SelectTaskField = <T extends FieldValues>({ form, name, className, label, disabled, size, nullOption, projectId }: Props<T>) => {
    const { orgId, member } = useMember();

    const { data: tasks } = trpc.tasks.useQuery({ orgId, projectId: projectId!, assignedMember: member.id }, { enabled: Boolean(projectId) });

    return (
        <SelectField
            size={size}
            disabled={disabled}
            nullOption={nullOption ? 'No Task' : undefined}
            form={form}
            name={name}
            className={className}
            label={label}
            selectOptions={(tasks || []).map(({ taskNumber, id }) => ({
                label: `task-${taskNumber}`,
                value: id,
            }))}
        />
    );
};
