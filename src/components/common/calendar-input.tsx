import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import React from 'react';

type Props = {
    selected?: Date;
    onSelect?: (val: Date | undefined) => void;
    placeholder?: string;
    className?: React.HTMLAttributes<'div'>['className'];
    saleDate?: Date | undefined;
    label?: string;
};

export const CalendarInput = ({ selected, onSelect, saleDate, label, className, placeholder }: Props) => {
    const [open, setOpen] = React.useState(false);

    return (
        <div className={className}>
            {label && <div className="mb-1 font-medium">{label}</div>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant={'outline'}>
                        {selected ? format(selected, 'dd.MM.yyyy') : placeholder && <span className="text-muted-foreground">{placeholder}</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selected}
                        onSelect={(val) => {
                            onSelect?.(val);
                            setOpen(false);
                        }}
                        disabled={(date) => date < new Date('1900-01-01')}
                        captionLayout="dropdown"
                        today={saleDate}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};
