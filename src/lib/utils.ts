import { clsx, type ClassValue } from 'clsx';
import dayjs, { Dayjs } from 'dayjs';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * formatMinutes(70) = 1h 10min
 */
export const formatMinutes = (value: number) => {
    const hours = Math.floor(value / 60);
    const min = value % 60;
    return `${hours}h ${min}min`;
};

export const getDiffInMinutes = ({ start, end }: { start: Date; end: Date | null }) => {
    return dayjs(end || Date.now()).diff(dayjs(start), 'minutes');
};

type Input = {
    start: Date;
    end: Date | null;
}[];

export const sumTimeEntries = (entries: Input) => {
    return entries.reduce((sum, entry) => {
        return sum + getDiffInMinutes({ start: entry.start, end: entry.end });
    }, 0);
};

export const prepareDateTime = (date: string | Date | Dayjs, time: string) => {
    const [hours, minutes] = time.split(':');
    const prepared = dayjs(date).hour(parseInt(hours, 10)).minute(parseInt(minutes, 10)).second(0).millisecond(0);
    return prepared.toDate();
};
