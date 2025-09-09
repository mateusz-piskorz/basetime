'use client';

import { TimeEntryReportChart } from '@/components/common/time-entry-report-chart';
import { trpc } from '@/lib/trpc/client';
import { timeEntrySegments } from '@/lib/utils/timeEntrySegments';
import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import { Clock } from 'lucide-react';
import { useMemo } from 'react';

dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
    weekStart: 1,
});

export const ThisWeekChart = () => {
    const { data } = trpc.getTimeEntryDashboard.useQuery({
        startDate: dayjs().startOf('week').toDate().toString(),
        endDate: dayjs().endOf('week').toDate().toString(),
    });

    const segments = useMemo(
        () =>
            timeEntrySegments({
                timeEntries: data || [],
                start: dayjs().startOf('week').toDate().toString(),
                end: dayjs().endOf('week').toDate().toString(),
                roundUpSecondsThreshold: 0,
                granularity: 'day',
                nameFormatter: ({ date }) => dayjs(date).format('dddd'),
            }),
        [data],
    );

    return (
        <div className="flex-1 md:flex-8/12">
            <>
                <div className="mb-4 flex items-center gap-2">
                    <Clock className="text-muted-foreground size-5" />
                    <h2>This Week</h2>
                </div>
                <TimeEntryReportChart data={segments} />
            </>
        </div>
    );
};
