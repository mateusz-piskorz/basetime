'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useDayjs } from '@/lib/hooks/use-dayjs';
import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { formatMinutes } from '@/lib/utils/common';
import { timeEntrySegments } from '@/lib/utils/timeEntrySegments';
import { Activity } from 'lucide-react';
import { useMemo } from 'react';
import { Scope } from './types';

type Props = {
    scope: Scope;
};

export const ActivityGraph = ({ scope }: Props) => {
    const { dayjs } = useDayjs();
    const { organizationId } = useMember();
    const { data: timeEntries } = trpc.timeEntriesPaginated.useQuery({
        organizationId,
        ...(scope === 'organization' && { members: 'all' }),
        startDate: dayjs().subtract(2, 'month').startOf('week').toDate().toString(),
    });

    const { segments, max } = useMemo(
        () =>
            timeEntrySegments({
                timeEntries: timeEntries?.data || [],
                start: dayjs().subtract(2, 'month').startOf('week').toDate(),
                end: new Date(),
                granularity: 'day',
                dayjs,
            }),
        [timeEntries, dayjs],
    );

    const weekSegments = Array.from({ length: 7 }, (_, i) => dayjs().startOf('week').add(i, 'day').format('ddd'));
    const monthSegments = Array.from({ length: 3 }, (_, i) => dayjs().startOf('month').subtract(i, 'month').format('MMM')).reverse();

    return (
        <div className="flex-1 md:min-w-[330px]">
            <div className="mb-4 flex items-center gap-2">
                <Activity className="text-muted-foreground size-5" />
                <h2>Activity Graph</h2>
            </div>

            <Card className="dark:bg-card h-[300px] border bg-transparent py-0 pt-4 shadow-none">
                <CardContent className="space-y-3 px-4 sm:px-6">
                    <div className="flex justify-around sm:ml-[36px]">
                        {monthSegments.map((month) => (
                            <span className="text-sm" key={month}>
                                {month}
                            </span>
                        ))}
                    </div>

                    <div className="flex h-full space-x-2">
                        <div className="hidden h-full flex-col justify-between sm:flex">
                            {weekSegments.map((weekDay) => (
                                <span className="h-[24px] text-sm" key={weekDay}>
                                    {weekDay}
                                </span>
                            ))}
                        </div>

                        <div className="grid h-full w-full grid-flow-col gap-2" style={{ gridTemplateRows: 'repeat(7, minmax(0, 1fr)' }}>
                            {segments.map(({ loggedMinutes, name, start }) => (
                                <Tooltip key={name}>
                                    <TooltipTrigger asChild>
                                        <div className="bg-secondary flex min-h-[21px] rounded sm:h-auto">
                                            <div
                                                className="bg-accent w-full rounded"
                                                style={{
                                                    opacity:
                                                        max !== 0
                                                            ? loggedMinutes >= max
                                                                ? 0.9
                                                                : loggedMinutes >= max * 0.75
                                                                  ? 0.75
                                                                  : loggedMinutes >= max * 0.5
                                                                    ? 0.5
                                                                    : loggedMinutes >= max * 0.01
                                                                      ? 0.25
                                                                      : 0
                                                            : 0,
                                                }}
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="text-sm">
                                        <span className="font-bold">{formatMinutes(loggedMinutes)} </span>
                                        on {dayjs(start).format('MMMM D[th]')}
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
