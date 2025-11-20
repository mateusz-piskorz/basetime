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
};

export const SelectMemberField = <T extends FieldValues>({ form, name, className, label, disabled, size, nullOption }: Props<T>) => {
    const { orgId } = useMember();

    const { data: members } = trpc.members.useQuery({ orgId });

    return (
        <SelectField
            size={size}
            disabled={disabled}
            nullOption={nullOption ? 'Unassigned' : undefined}
            form={form}
            name={name}
            className={className}
            label={label}
            selectOptions={(members || []).map(({ id, User }) => ({
                label: User.name,
                value: id,
            }))}
        />
    );
};
