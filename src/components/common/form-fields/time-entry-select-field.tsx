/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { useMember } from '@/lib/hooks/use-member';
import { trpc, TrpcRouterOutput } from '@/lib/trpc/client';
import { Nullable, TypedFieldPath } from '@/lib/types/common';
import { cn } from '@/lib/utils';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { ProjectBadge } from '../project-badge';

type TimeEntry = NonNullable<TrpcRouterOutput['getMemberTimeEntries']>['data'][number];

type FieldType = Nullable<string>;

type Props<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: TypedFieldPath<T, FieldType>;
    onSelect?: (val: TimeEntry) => void;
    disabled?: boolean;
    className?: string;
    classNameInput?: string;
    placeholder?: string;
};

export const TimeEntrySelectField = <T extends FieldValues>({ form, onSelect, name, disabled, className, classNameInput, placeholder }: Props<T>) => {
    const [open, setOpen] = useState(false);
    const { control } = form as unknown as UseFormReturn<{ [x: string]: FieldType }>;
    const memberId = useMember().member.id;
    const [q, setQ] = useState('');

    const { data } = trpc.getMemberTimeEntries.useQuery({ memberId, limit: '7', q, order_column: 'createdAt', order_direction: 'desc' });

    const debouncedSetQ = useCallback(
        debounce((q) => setQ(q), 400),
        [],
    );

    const hasOptions = data && data.data.length > 0;

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (disabled) {
            setOpen(false);
        }
    }, [disabled]);

    return (
        <>
            <FormField
                control={control}
                name={name}
                render={({ field }) => {
                    return (
                        <FormItem className={cn('w-full', className)}>
                            <FormControl>
                                <Popover open={hasOptions ? open : false} onOpenChange={setOpen}>
                                    <PopoverAnchor asChild>
                                        <Input
                                            className={classNameInput}
                                            {...field}
                                            ref={inputRef}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                debouncedSetQ(e.target.value);
                                            }}
                                            disabled={disabled}
                                            placeholder={placeholder}
                                            value={field.value || ''}
                                            role="combobox"
                                            aria-expanded={open}
                                            onFocus={() => {
                                                if (!open) {
                                                    setOpen(true);
                                                }
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        />
                                    </PopoverAnchor>

                                    <PopoverContent
                                        sideOffset={8}
                                        style={{ width: 'var(--radix-popover-trigger-width)' }}
                                        className="p-0"
                                        onInteractOutside={(e) => {
                                            if (inputRef.current && inputRef.current.contains(e.target as Node)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onOpenAutoFocus={(e) => e.preventDefault()}
                                    >
                                        <Command>
                                            <CommandList>
                                                <CommandGroup>
                                                    <p className="text-muted-foreground px-2 py-[1px] text-xs">Recently tracked time entries</p>
                                                    {data?.data.map((timeEntry) => (
                                                        <CommandItem
                                                            className="flex justify-between"
                                                            key={timeEntry.id}
                                                            value={timeEntry.id}
                                                            onSelect={() => {
                                                                field.onChange(timeEntry.name);
                                                                onSelect?.(timeEntry);
                                                                setOpen(false);
                                                            }}
                                                        >
                                                            <p className="truncate">{timeEntry.name}</p>
                                                            <ProjectBadge
                                                                name={timeEntry.Project?.name || 'No Project'}
                                                                color={timeEntry.Project?.color || 'GRAY'}
                                                            />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </FormControl>
                        </FormItem>
                    );
                }}
            />
        </>
    );
};
