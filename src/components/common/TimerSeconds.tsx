import { cn } from '@/lib/utils/common';
import { useEffect, useState } from 'react';

type Props = {
    initialSeconds: number;
    isActive: boolean;
    className?: string;
};

const returnTime = (seconds: number) => {
    const m = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(1, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return { m, s };
};

export const TimerSeconds = ({ initialSeconds, isActive, className }: Props) => {
    const [elapsedSeconds, setElapsedSeconds] = useState<number>(initialSeconds);

    useEffect(() => {
        if (isActive) {
            const updateElapsed = () => {
                setElapsedSeconds((prev) => prev + 1);
            };

            updateElapsed();
            const interval = setInterval(updateElapsed, 1000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [isActive]);

    const { m, s } = returnTime(elapsedSeconds);

    return (
        <div className={cn('flex min-w-[70px] items-center text-center text-sm sm:gap-[1px] sm:text-base sm:font-bold', className)}>
            <span className="inline-block w-[22px] text-right sm:w-[24px]">{m}</span>
            <span className="mb-0.5">:</span>
            <span className="inline-block w-[22px] sm:w-[24px]">{s}</span>
        </div>
    );
};
