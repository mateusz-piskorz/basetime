'use client';

import { Card, CardContent } from '@/components/ui/card';

import { useDayjs } from '@/lib/hooks/use-dayjs';
import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { cn, formatMinutes } from '@/lib/utils/common';
import { timeEntrySegments } from '@/lib/utils/timeEntrySegments';
import { CalendarRange } from 'lucide-react';
import { useMemo } from 'react';
import { Scope } from './types';

type Props = {
    scope: Scope;
};

export const Last7Days = ({ scope }: Props) => {
    const { dayjs } = useDayjs();

    const { organizationId } = useMember();
    const { data: timeEntries } = trpc.timeEntriesPaginated.useQuery({
        organizationId,
        ...(scope === 'organization' && { members: 'all' }),
        startDate: dayjs().subtract(7, 'day').toDate().toString(),
    });

    const { segments } = useMemo(
        () =>
            timeEntrySegments({
                timeEntries: timeEntries?.data || [],
                start: dayjs().toDate(),
                end: dayjs().subtract(6, 'day').toDate(),
                granularity: 'day',
                nameFormatter: ({ index }) => (index === 0 ? 'Today' : index === 1 ? 'Yesterday' : `${index + 1} days ago`),
                dayjs,
            }),
        [timeEntries, dayjs],
    );

    return (
        <div className="flex-1 md:min-w-[330px] lg:min-w-[300px]">
            <div className="mb-4 flex items-center gap-2">
                <CalendarRange className="text-muted-foreground size-5" />
                <h2>Last 7 Days</h2>
            </div>
            <Card className="dark:bg-card h-[300px] border bg-transparent py-0 shadow-none">
                <CardContent className="flex h-full flex-col p-0">
                    {segments.map((segment, idx) => (
                        <div
                            key={`${idx}-segment`}
                            className={cn('flex h-full items-center justify-between px-4 text-sm', idx !== segments.length - 1 && 'border-b-1')}
                        >
                            <span className="w-[70px]">{segment.name}</span>
                            <span className="text-muted-foreground hidden tracking-widest sm:inline-block">-------</span>
                            <span className="w-[72px] text-right">{formatMinutes(segment.loggedMinutes)}</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};
