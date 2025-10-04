'use client';

import { TimeEntryReportChart } from '@/components/common/time-entry-report-chart';

import { useDayjs } from '@/lib/hooks/use-dayjs';
import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { timeEntrySegments } from '@/lib/utils/timeEntrySegments';
import { Clock } from 'lucide-react';
import { useMemo } from 'react';
import { Scope } from './types';

type Props = {
    scope: Scope;
};

export const ThisWeekChart = ({ scope }: Props) => {
    const { dayjs } = useDayjs();
    const { organizationId } = useMember();
    const { data: timeEntries } = trpc.timeEntriesPaginated.useQuery({
        organizationId,
        ...(scope === 'organization' && { members: 'all' }),
        startDate: dayjs().startOf('week').toDate().toString(),
        endDate: dayjs().endOf('week').toDate().toString(),
    });

    const { segments } = useMemo(
        () =>
            timeEntrySegments({
                timeEntries: timeEntries?.data || [],
                start: dayjs().startOf('week').toDate(),
                end: dayjs().endOf('week').toDate(),
                granularity: 'day',
                nameFormatter: ({ date }) => dayjs(date).format('dddd'),
                dayjs,
            }),
        [timeEntries, dayjs],
    );

    return (
        <div className="flex-1 md:flex-8/12">
            <>
                <div className="mb-4 flex items-center gap-2">
                    <Clock className="text-muted-foreground size-5" />
                    <h2>This Week</h2>
                </div>
                <TimeEntryReportChart data={segments} className="h-[310px]" />
            </>
        </div>
    );
};
