'use client';

import { Check, PlusCircle } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

import { cn } from '@/lib/utils';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Props = {
    title: string;
    filterKey: string;
    options: {
        label: string;
        value: string;
        icon?: React.ComponentType<{ className?: string }>;
    }[];
    singleChoice?: boolean;
};

// todo: fixme

export function MultiOptionsFilter({ filterKey, title, options, singleChoice }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const values = searchParams.getAll(filterKey);

    const setValues = (val: string[] | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (val) {
            params.delete(filterKey);
            val.forEach((singleVal) => {
                params.append(filterKey, singleVal);
            });
        } else {
            params.delete(filterKey);
        }

        router.replace(pathname + '?' + params.toString());
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="group h-9 bg-transparent">
                    <PlusCircle />
                    {title}
                    {values.length > 0 && (
                        <>
                            <Separator orientation="vertical" className="group-hover:bg-card mx-2 h-4" />
                            <Badge variant="secondary" className="group-hover:bg-card rounded-xs px-1 font-normal lg:hidden">
                                {values.length}
                            </Badge>
                            <div className="hidden gap-1 lg:flex">
                                {values.length > 2 ? (
                                    <Badge variant="secondary" className="group-hover:bg-card rounded-xs px-1 font-normal">
                                        {values.length} selected
                                    </Badge>
                                ) : (
                                    options
                                        .filter((option) => values.includes(option.value))
                                        .map((option) => (
                                            <Badge variant="secondary" key={option.value} className="group-hover:bg-card rounded-xs px-1 font-normal">
                                                {option.label}
                                            </Badge>
                                        ))
                                )}
                            </div>
                        </>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput placeholder={title} />
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
                                                setValues(values.filter((v) => v !== option.value));
                                            } else {
                                                setValues(singleChoice ? [option.value] : [...values, option.value]);
                                            }
                                        }}
                                    >
                                        <div
                                            className={cn(
                                                'flex size-4 items-center justify-center rounded-[4px] border',
                                                isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-input [&_svg]:invisible',
                                            )}
                                        >
                                            <Check className="text-primary-foreground size-3.5" />
                                        </div>
                                        {option.icon && <option.icon className="text-muted-foreground size-4" />}
                                        <span>{option.label}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                        {values.length > 0 && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem onSelect={() => setValues(null)} className="justify-center text-center">
                                        Clear filters
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
