import { cn } from '@/lib/utils/common';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

type Props = {
    startDate: Date;
    isActive: boolean;
    className?: string;
};

const returnTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
        .toString()
        .padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return { h, m, s };
};

export const Timer = ({ startDate, isActive, className }: Props) => {
    const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

    useEffect(() => {
        if (isActive) {
            setTimeout(() => {
                setElapsedSeconds(dayjs().diff(startDate, 's'));
            }, 1000);
        } else setElapsedSeconds(0);
    }, [isActive, elapsedSeconds, startDate]);

    const { h, m, s } = returnTime(elapsedSeconds);

    return (
        <div className={cn('flex min-w-[70px] items-center text-center text-sm sm:gap-px sm:text-base sm:font-bold', className)}>
            <span className="inline-block w-[22px] sm:w-6">{h}</span>
            <span className="mb-0.5">:</span>
            <span className="inline-block w-[22px] text-right sm:w-6">{m}</span>
            <span className="mb-0.5">:</span>
            <span className="inline-block w-[22px] sm:w-6">{s}</span>
        </div>
    );
};
