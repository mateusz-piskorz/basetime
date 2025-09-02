import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TypedFieldPath } from '@/lib/types/common';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';

type FieldType = Date;

type Props<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: TypedFieldPath<T, FieldType>;
    placeholder?: string;
    className?: React.HTMLAttributes<'div'>['className'];
    saleDate?: Date | undefined;
    label?: string;
    onSelect?: (val: Date | undefined) => void;
};

export const CalendarField = <T extends FieldValues>({ form, name: propsName, saleDate, label, className, placeholder, onSelect }: Props<T>) => {
    const name = propsName as string;
    const [open, setOpen] = useState(false);
    const { control } = form as unknown as UseFormReturn<{ [x: string]: FieldType }>;

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <FormItem className={className}>
                    {label && <FormLabel>{label}</FormLabel>}
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                                <Button variant={'outline'}>
                                    {field.value
                                        ? format(field.value, 'dd.MM.yyyy')
                                        : placeholder && <span className="text-muted-foreground">{placeholder}</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(val) => {
                                    field.onChange(val);
                                    setOpen(false);
                                    onSelect?.(val);
                                }}
                                disabled={(date) => date < new Date('1900-01-01')}
                                captionLayout="dropdown"
                                today={saleDate}
                            />
                        </PopoverContent>
                    </Popover>
                </FormItem>
            )}
        />
    );
};
