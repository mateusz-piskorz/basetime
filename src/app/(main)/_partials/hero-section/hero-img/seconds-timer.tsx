import { cn, formatSeconds } from '@/lib/utils/common';
import React from 'react';

type Props = {
    initSeconds: number;
    isActive: boolean;
};

export const SecondsTimer = ({ initSeconds, isActive }: Props) => {
    const [elapsedSeconds, setElapsedSeconds] = React.useState(initSeconds);

    React.useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isActive) {
            const updateElapsed = () => {
                setElapsedSeconds((prev) => prev + 1);
                timeoutId = setTimeout(updateElapsed, 1000);
            };

            updateElapsed();
        }

        return () => {
            clearTimeout(timeoutId);
        };
    }, [isActive]);

    return (
        <div className={cn('flex min-w-[100px] items-center justify-center text-center text-sm', 'sm:gap-px sm:text-base sm:font-bold')}>
            {formatSeconds(elapsedSeconds)}
        </div>
    );
};
