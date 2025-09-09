'use client';

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { cn, formatMinutes } from '@/lib/utils/common';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

type Props = {
    className?: string;
    withFilters?: boolean;
    data: { loggedMinutes: number; name: string }[];
};

export const TimeEntryReportChart = ({ className, data }: Props) => {
    const chartConfig = {
        loggedMinutes: {
            label: 'paid',
            color: '#60a5fa',
        },
    } satisfies ChartConfig;

    return (
        <ChartContainer config={chartConfig} className={cn('aspect-auto h-[350px] w-full', className)}>
            <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            formatter={(minutes) => (
                                <>
                                    <div className="bg-accent-secondary h-2 w-2" />
                                    <span className="font-bold">{formatMinutes(minutes as number)}</span>
                                </>
                            )}
                        />
                    }
                />
                <Bar dataKey="loggedMinutes" fill="var(--accent-secondary)" radius={2} />
            </BarChart>
        </ChartContainer>
    );
};
