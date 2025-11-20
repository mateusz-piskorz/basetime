'use client';

import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';

import { Nullable, TypedFieldPath } from '@/lib/types/common';
import { ComponentProps } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { ProjectBadge } from '../../project-badge';
import { SelectField } from '../select-field';

type Props<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: TypedFieldPath<T, Nullable<string>>;
    label?: string;
    className?: string;
    disabled?: boolean;
    size?: ComponentProps<typeof SelectField>['size'];
    nullOption?: boolean;
};

export const SelectProjectField = <T extends FieldValues>({ form, name, className, label, disabled, size, nullOption }: Props<T>) => {
    const { orgId } = useMember();
    const { data: projects } = trpc.projects.useQuery({ orgId });

    return (
        <SelectField
            size={size}
            disabled={disabled}
            nullOption={nullOption ? 'No Project' : undefined}
            form={form}
            name={name}
            className={className}
            label={label}
            selectOptions={(projects || []).map(({ color, id, shortName }) => ({
                label: <ProjectBadge className="border-none px-0" hex={color} name={shortName} />,
                value: id,
            }))}
        />
    );
};
