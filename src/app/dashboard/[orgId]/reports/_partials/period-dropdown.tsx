'use client';
import React from 'react';

import { CalendarInput } from '@/components/common/calendar-input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDayjs } from '@/lib/hooks/use-dayjs';
import { CalendarClockIcon } from 'lucide-react';

type Props = {
    startDate: Date;
    setStartDate: (val: Date) => void;
    endDate: Date;
    setEndDate: (val: Date) => void;
};

export const PeriodDropdown = ({ endDate, setEndDate, startDate, setStartDate }: Props) => {
    const { dayjs } = useDayjs();
    const [open, setOpen] = React.useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="text-muted-foreground space-x-2">
                    <CalendarClockIcon className="text-primary" />
                    <span>{dayjs(startDate).format('DD/MM/YYYY')}</span>
                    <span>-</span>
                    <span>{dayjs(endDate).format('DD/MM/YYYY')}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="flex w-80 gap-8 rounded py-0">
                <div className="flex w-2/5 flex-col items-start gap-2 border-e-[1px] py-4">
                    <Button
                        variant="ghost"
                        className="h-8 min-h-0"
                        onClick={() => {
                            setStartDate(dayjs().startOf('week').toDate());
                            setEndDate(dayjs().endOf('week').toDate());

                            setOpen(false);
                        }}
                    >
                        This week
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-8 min-h-0"
                        onClick={() => {
                            setStartDate(dayjs().subtract(1, 'week').startOf('week').toDate());
                            setEndDate(dayjs().subtract(1, 'week').endOf('week').toDate());

                            setOpen(false);
                        }}
                    >
                        Last week
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-8 min-h-0"
                        onClick={() => {
                            setStartDate(dayjs().startOf('month').toDate());
                            setEndDate(dayjs().endOf('month').toDate());

                            setOpen(false);
                        }}
                    >
                        This month
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-8 min-h-0"
                        onClick={() => {
                            setStartDate(dayjs().subtract(1, 'month').startOf('month').toDate());
                            setEndDate(dayjs().subtract(1, 'month').endOf('month').toDate());

                            setOpen(false);
                        }}
                    >
                        Last month
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-8 min-h-0"
                        onClick={() => {
                            setStartDate(dayjs().subtract(90, 'day').toDate());
                            setEndDate(dayjs().toDate());

                            setOpen(false);
                        }}
                    >
                        Last 90 days
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-8 min-h-0"
                        onClick={() => {
                            setStartDate(dayjs().startOf('year').toDate());
                            setEndDate(dayjs().endOf('year').toDate());

                            setOpen(false);
                        }}
                    >
                        This year
                    </Button>
                    <Button
                        variant="ghost"
                        className="h-8 min-h-0"
                        onClick={() => {
                            setStartDate(dayjs().subtract(1, 'year').startOf('year').toDate());
                            setEndDate(dayjs().subtract(1, 'year').endOf('year').toDate());

                            setOpen(false);
                        }}
                    >
                        Last year
                    </Button>
                </div>

                <div className="w-3/5 space-y-5 py-4">
                    <span className="font-mono text-sm">Start</span>
                    <CalendarInput
                        className="mt-2"
                        selected={startDate}
                        onSelect={(val) => {
                            setStartDate(val || dayjs().startOf('week').toDate());
                            setOpen(false);
                        }}
                    />
                    <span className="font-mono text-sm">End</span>
                    <CalendarInput
                        className="mt-2"
                        selected={endDate}
                        onSelect={(val) => {
                            setStartDate(val || new Date());
                            setOpen(false);
                        }}
                    />
                </div>
            </PopoverContent>
        </Popover>
    );
};
