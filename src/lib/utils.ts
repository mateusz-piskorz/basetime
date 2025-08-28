import { clsx, type ClassValue } from 'clsx';
import dayjs from 'dayjs';
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
