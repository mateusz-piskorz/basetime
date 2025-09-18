import { Dayjs } from 'dayjs';
import { getDurationInMinutes } from './common';

export type Granularity = 'day' | 'week' | 'month';

const dayBoundary = ({ boundary, date, dayjs }: { dayjs: typeof import('dayjs'); date: string | Date | Dayjs; boundary: 'start' | 'end' }): Date => {
    const hour = boundary === 'start' ? 0 : 23;
    const minute = boundary === 'start' ? 0 : 59;
    const second = boundary === 'start' ? 0 : 59;
    const millisecond = boundary === 'start' ? 0 : 999;
    return dayjs(date).hour(hour).minute(minute).second(second).millisecond(millisecond).toDate();
};

type DateSegments = {
    start: Date | string | Dayjs;
    end: Date | string | Dayjs;
    granularity: Granularity;
    nameFormatter?: (val: { index: number; date: Date }) => string;
    dayjs: typeof import('dayjs');
};

const dateSegments = ({ start, end, granularity, nameFormatter, dayjs }: DateSegments) => {
    const result: { start: Date; end: Date; loggedMinutes: number; timeEntriesCount: number; name: string }[] = [];
    let current = dayjs(start).startOf(granularity);
    const last = dayjs(end).startOf(granularity);
    const isForward = current.isSameOrBefore(last, granularity);
    let index = 0;

    while (isForward ? current.isSameOrBefore(last, granularity) : current.isSameOrAfter(last, granularity)) {
        const start = dayBoundary({ date: current, boundary: 'start', dayjs });
        const end = dayBoundary({ date: dayjs(current).endOf(granularity), boundary: 'end', dayjs });
        result.push({
            start,
            end,
            loggedMinutes: 0,
            timeEntriesCount: 0,
            name:
                nameFormatter?.({ index, date: start }) ||
                dayjs(start).format(granularity === 'day' ? 'DD-MM-YYYY' : granularity === 'week' ? '[Week] WW' : 'MM-YYYY'),
        });
        current = isForward ? current.add(1, granularity) : current.subtract(1, granularity);
        index++;
    }
    return result;
};

type TimeEntrySegments = {
    start: Date | string | Dayjs;
    end: Date | string | Dayjs;
    timeEntries: { start: string; end: string | null }[];
    granularity?: Granularity;
    nameFormatter?: (val: { index: number; date: Date }) => string;
    dayjs: typeof import('dayjs');
};

export const timeEntrySegments = ({ start, end, timeEntries, granularity = 'day', nameFormatter, dayjs }: TimeEntrySegments) => {
    let max = 0;
    const segments = dateSegments({ start, end, granularity, nameFormatter, dayjs }).map((segment) => {
        let { loggedMinutes } = segment;
        let { timeEntriesCount } = segment;

        for (const entry of timeEntries) {
            const entryStart = new Date(entry.start);
            const entryEnd = entry.end ? new Date(entry.end) : new Date();

            const overlapStart = entryStart > segment.start ? entryStart : segment.start;
            const overlapEnd = entryEnd < segment.end ? entryEnd : segment.end;

            const duration = getDurationInMinutes({ end: overlapEnd, start: overlapStart, dayjs });

            if (duration > 0) {
                loggedMinutes += duration;
                timeEntriesCount += 1;
            }
        }

        if (loggedMinutes > max) max = loggedMinutes;

        return {
            ...segment,
            loggedMinutes,
            timeEntriesCount,
        };
    });

    return { segments, max };
};
