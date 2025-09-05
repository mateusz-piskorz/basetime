'use client';

import { Check, PlusCircle } from 'lucide-react';
import * as React from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

import { Nullable, TypedFieldPath } from '@/lib/types/common';
import { cn } from '@/lib/utils';

type FieldType = Nullable<string[]>;

type Option = {
    label: string | React.ReactNode;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
};

type Props<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: TypedFieldPath<T, FieldType>;
    options: Option[];
    title?: string;
    label?: string;
    className?: React.HTMLAttributes<'div'>['className'];
    singleChoice?: boolean;
    placeholder?: string;
    errorMessage?: boolean;
    disabled?: boolean;
    size?: 'sm' | 'default' | 'lg';
};

export const MultiSelectField = <T extends FieldValues>({
    form,
    name: propsName,
    options,
    title,
    label,
    className,
    singleChoice,
    placeholder,
    errorMessage = true,
    disabled,
    size,
}: Props<T>) => {
    const name = propsName as string;
    const { control } = form as unknown as UseFormReturn<{ [x: string]: FieldType }>;

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const values = field.value ?? [];
                const setValues = (val: string[] | null) => {
                    field.onChange(val ?? []);
                };

                return (
                    <FormItem className={cn('flex min-w-0 flex-col', className)}>
                        {label && <FormLabel>{label}</FormLabel>}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    size={size ?? 'sm'}
                                    className="group flex h-9 justify-around bg-transparent"
                                    disabled={disabled}
                                >
                                    <PlusCircle />
                                    {title}
                                    {values.length > 0 && (
                                        <>
                                            <Separator orientation="vertical" className="group-hover:bg-card mx-2 h-4" />
                                            <div className="flex gap-1 truncate">
                                                {options
                                                    .filter((option) => values.includes(option.value))
                                                    .map((option) => (
                                                        <Badge
                                                            variant="secondary"
                                                            key={option.value}
                                                            className="group-hover:bg-card rounded-xs px-1 font-normal"
                                                        >
                                                            {option.label}
                                                        </Badge>
                                                    ))}
                                            </div>
                                        </>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder={placeholder ?? title} />
                                    <CommandList>
                                        <CommandEmpty>No results found.</CommandEmpty>
                                        <CommandGroup>
                                            {options.map((option) => {
                                                const isSelected = values.includes(option.value);

                                                return (
                                                    <CommandItem
                                                        value={option.value}
                                                        key={option.value}
                                                        onSelect={() => {
                                                            if (isSelected) {
                                                                setValues(values.filter((v: string) => v !== option.value));
                                                            } else {
                                                                setValues(singleChoice ? [option.value] : [...values, option.value]);
                                                            }
                                                        }}
                                                    >
                                                        <div
                                                            className={cn(
                                                                'flex size-4 items-center justify-center rounded-[4px] border',
                                                                isSelected
                                                                    ? 'bg-primary border-primary text-primary-foreground'
                                                                    : 'border-input [&_svg]:invisible',
                                                            )}
                                                        >
                                                            <Check className="text-primary-foreground size-3.5" />
                                                        </div>
                                                        {option.icon && <option.icon className="text-muted-foreground size-4" />}
                                                        {typeof option.label === 'string' ? <span>{option.label}</span> : option.label}
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                        {values.length > 0 && (
                                            <>
                                                <CommandSeparator />
                                                <CommandGroup>
                                                    <CommandItem onSelect={() => setValues(null)} className="justify-center text-center">
                                                        Clear selections
                                                    </CommandItem>
                                                </CommandGroup>
                                            </>
                                        )}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        {errorMessage && <FormMessage />}
                    </FormItem>
                );
            }}
        />
    );
};
