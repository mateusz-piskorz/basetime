import { TASK_PRIORITY_COLORS } from '@/lib/constants/task-priority-colors';
import { Nullable, TypedFieldPath } from '@/lib/types/common';
import { cn } from '@/lib/utils/common';
import { TASK_PRIORITY } from '@prisma/client';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { SelectField } from '../select-field';

type Props<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: TypedFieldPath<T, Nullable<string>>;
    label?: string;
    className?: string;
};

export const SelectTaskPriorityField = <T extends FieldValues>({ form, name, label, className }: Props<T>) => {
    return (
        <SelectField
            form={form}
            name={name}
            className={className}
            label={label}
            selectOptions={Object.values(TASK_PRIORITY).map((priority) => ({
                label: (
                    <>
                        <span className="h-2 min-w-2 rounded-full" style={{ backgroundColor: TASK_PRIORITY_COLORS[priority] }} />
                        <span className={cn('max-w-[100px] truncate')}>{priority.toLowerCase()}</span>
                    </>
                ),
                value: priority,
            }))}
        />
    );
};
