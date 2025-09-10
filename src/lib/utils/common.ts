import { clsx, type ClassValue } from 'clsx';
import dayjs, { Dayjs } from 'dayjs';
import { twMerge } from 'tailwind-merge';

/** 0-60, amount of minutes rounded up to full hour (0=everything rounded up) */
const roundUpMinutesThreshold = 1;
/** 0-60, amount of seconds rounded up to full minute (0=everything rounded up) */
const roundUpSecondsThreshold = 1;

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const calculateBillableAmount = ({ hourlyRate, minutes }: { minutes: number; hourlyRate: number }) => {
    const fullHours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    let hours;
    if (remainingMinutes >= roundUpMinutesThreshold) {
        hours = fullHours + 1;
    } else {
        hours = fullHours;
    }

    return hours * hourlyRate;
};

export const sumBillableAmount = (members: { minutes: number; hourlyRate: number }[]) => {
    return members.reduce((sum, { hourlyRate, minutes }) => {
        return sum + calculateBillableAmount({ hourlyRate, minutes });
    }, 0);
};

/**
 * formatMinutes(70) = 1h 10min
 */
export const formatMinutes = (value: number) => {
    const hours = Math.floor(value / 60);
    const min = value % 60;
    return `${hours}h ${min}min`;
};

export const getDurationInMinutes = ({ start, end }: { start: Date | string | Dayjs; end: Date | string | Dayjs | null }) => {
    const diffSeconds = dayjs(end || Date.now()).diff(dayjs(start), 's');

    const fullMinutes = Math.floor(diffSeconds / 60);
    const remainingSeconds = diffSeconds % 60;
    let minutes;
    if (remainingSeconds >= roundUpSecondsThreshold) {
        minutes = fullMinutes + 1;
    } else {
        minutes = fullMinutes;
    }

    return minutes;
};

type Input = {
    start: Date | string;
    end: Date | string | null;
}[];

export const sumTimeEntries = (entries: Input) => {
    return entries.reduce((sum, entry) => {
        return sum + getDurationInMinutes({ start: entry.start, end: entry.end });
    }, 0);
};

export const prepareDateTime = (date: string | Date | Dayjs, time: string) => {
    const [hours, minutes] = time.split(':');
    const prepared = dayjs(date).hour(Number(hours)).minute(Number(minutes)).second(0).millisecond(0);
    return prepared.toDate();
};
