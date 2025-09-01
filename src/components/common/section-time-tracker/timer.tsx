import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type Props = {
    startDate: Date;
    isActive: boolean;
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

export const Timer = ({ startDate, isActive }: Props) => {
    const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

    useEffect(() => {
        if (isActive) {
            const updateElapsed = () => {
                setElapsedSeconds(Math.floor((Date.now() - startDate.getTime()) / 1000));
            };

            updateElapsed();
            const interval = setInterval(updateElapsed, 1000);

            return () => clearInterval(interval);
        } else {
            setElapsedSeconds(0);
        }
    }, [startDate, isActive]);

    const { h, m, s } = returnTime(elapsedSeconds);

    return (
        <div className={cn('flex min-w-[70px] items-center text-center text-sm sm:gap-[1px] sm:text-base sm:font-bold')}>
            <span className="inline-block w-[22px] sm:w-[24px]">{h}</span>
            <span className="mb-0.5">:</span>
            <span className="inline-block w-[22px] sm:w-[24px]">{m}</span>
            <span className="mb-0.5">:</span>
            <span className="inline-block w-[22px] sm:w-[24px]">{s}</span>
        </div>
    );
};
