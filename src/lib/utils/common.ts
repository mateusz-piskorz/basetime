import { clsx, type ClassValue } from 'clsx';
import { Dayjs } from 'dayjs';
import { twMerge } from 'tailwind-merge';

/** 0-60, amount of seconds rounded up to full minute (0=everything rounded up) */
const roundUpSecondsThreshold = 0;

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const calculateBillableAmount = ({
    hourlyRate,
    minutes,
    roundUpMinutesThreshold,
}: {
    minutes: number;
    hourlyRate: number;
    roundUpMinutesThreshold: number;
}) => {
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

export const sumBillableAmount = ({
    members,
    roundUpMinutesThreshold,
}: {
    roundUpMinutesThreshold: number;
    members: { minutes: number; hourlyRate: number }[];
}) => {
    return members.reduce((sum, { hourlyRate, minutes }) => {
        return sum + calculateBillableAmount({ hourlyRate, minutes, roundUpMinutesThreshold });
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

export const getDurationInMinutes = ({
    start,
    end,
    dayjs,
}: {
    dayjs: typeof import('dayjs');
    start: Date | string | Dayjs;
    end: Date | string | Dayjs | null;
}) => {
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

export const sumTimeEntries = ({ entries, dayjs }: { entries: Input; dayjs: typeof import('dayjs') }) => {
    return entries.reduce((sum, entry) => {
        return sum + getDurationInMinutes({ start: entry.start, end: entry.end, dayjs });
    }, 0);
};

export const prepareDateTime = ({ date, dayjs, time }: { date: string | Date | Dayjs; time: string; dayjs: typeof import('dayjs') }) => {
    const [hours, minutes] = time.split(':');
    const prepared = dayjs(date).hour(Number(hours)).minute(Number(minutes)).second(0).millisecond(0);
    return prepared.toDate();
};

export const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');

    if (names.length === 0) return '';
    if (names.length === 1) return names[0].charAt(0).toUpperCase();

    const firstInitial = names[0].charAt(0);
    const lastInitial = names[names.length - 1].charAt(0);

    return `${firstInitial}${lastInitial}`.toUpperCase();
};

export const getAppEnv = () => {
    const environments = { production: 'production', staging: 'staging', localhost: 'localhost' } as const;
    const env = process.env.NEXT_PUBLIC_APP_ENV as keyof typeof environments;
    1;

    return environments[env] || 'production';
};

export const getUserAvatarUrl = ({ avatarId }: { avatarId: string }) => {
    return process.env.NEXT_PUBLIC_MINIO_ENDPOINT === 'localhost'
        ? `http://localhost:9000/public/user-avatar/${avatarId}.jpeg`
        : `https://${process.env.NEXT_PUBLIC_MINIO_ENDPOINT}/public/user-avatar/${avatarId}.jpeg`;
};

const generateRandomString = (length = 6) =>
    Math.random()
        .toString(20)
        .slice(2, length + 2);
export const generateRandomSentence = (length = 6) => {
    let sentence = '';
    for (let i = 0; i < length; i++) {
        sentence += generateRandomString(Boolean(Math.random() > 0.5) ? 6 : 15) + ' ';
    }
    return sentence.trim();
};
