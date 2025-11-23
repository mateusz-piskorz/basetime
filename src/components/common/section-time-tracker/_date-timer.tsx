import { dayjs } from '@/lib/dayjs';
import { cn } from '@/lib/utils/common';
import React from 'react';

type Props = {
    startDate: Date;
    isActive: boolean;
};

export const DateTimer = ({ startDate, isActive }: Props) => {
    const [timerString, setTimerString] = React.useState('00:00:00');

    React.useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isActive) {
            const updateElapsed = () => {
                const elapsedSeconds = dayjs().diff(startDate, 'second');
                const newString = dayjs.duration(elapsedSeconds).format('hh:mm:ss');

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
        <div className={cn('flex min-w-[100px] items-center justify-center text-center text-sm', 'sm:gap-px sm:text-base sm:font-bold')}>
            {timerString}
        </div>
    );
};
