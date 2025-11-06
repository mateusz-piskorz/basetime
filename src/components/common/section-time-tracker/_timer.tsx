import { cn, formatSeconds } from '@/lib/utils/common';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

type Props = {
    startDate: Date;
    isActive: boolean;
    className?: string;
};

export const Timer = ({ startDate, isActive, className }: Props) => {
    const [timerString, setTimerString] = useState('00:00:00');

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isActive) {
            const updateElapsed = () => {
                const newString = formatSeconds(dayjs().diff(startDate, 's'));

                setTimerString(newString);
                document.title = `${newString} - BaseTime`;
                timeoutId = setTimeout(updateElapsed, 1000);
            };

            updateElapsed();
        } else setTimerString('00:00:00');

        return () => {
            document.title = 'BaseTime - Time Tracker';
            clearTimeout(timeoutId);
        };
    }, [isActive, startDate]);

    return (
        <div className={cn('flex min-w-[100px] items-center justify-center text-center text-sm sm:gap-px sm:text-base sm:font-bold', className)}>
            {timerString}
        </div>
    );
};
