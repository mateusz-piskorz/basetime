'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { cn, formatMinutes } from '@/lib/utils/common';
import { timeEntrySegments } from '@/lib/utils/timeEntrySegments';
import dayjs from 'dayjs';
import { CalendarRange } from 'lucide-react';
import { useMemo } from 'react';
import { Scope } from './types';

type Props = {
    scope: Scope;
};

export const Last7Days = ({ scope }: Props) => {
    const { organizationId, member } = useMember();
    const { data } = trpc.getTimeEntries.useQuery({
        organizationId,
        ...(scope === 'member' && { memberIds: [member.id] }),
        startDate: dayjs().subtract(7, 'day').toDate().toString(),
        endDate: new Date().toString(),
    });

    const segments = useMemo(
        () =>
            timeEntrySegments({
                timeEntries: data?.timeEntries || [],
                start: dayjs().toDate(),
                end: dayjs().subtract(6, 'day').toDate(),
                granularity: 'day',
                nameFormatter: ({ index }) => (index === 0 ? 'Today' : index === 1 ? 'Yesterday' : `${index + 1} days ago`),
            }),
        [data],
    );

    return (
        <div className="flex-1 md:min-w-[330px] lg:min-w-[300px]">
            <div className="mb-4 flex items-center gap-2">
                <CalendarRange className="text-muted-foreground size-5" />
                <h2>Last 7 Days</h2>
            </div>
            <Card className="h-[300px] py-0">
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
