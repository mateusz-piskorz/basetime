'use client';

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { cn, formatMinutes } from '@/lib/utils/common';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';

type Props = {
    className?: string;
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
                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                <Bar dataKey="loggedMinutes" fill="var(--accent)" radius={2} />
            </BarChart>
        </ChartContainer>
    );
};
