'use client';
import { Button } from '@/components/ui/button';
import { dayjs } from '@/lib/dayjs';
import { cn } from '@/lib/utils/common';
import { Clock } from 'lucide-react';
import React from 'react';

type Props = {
    title: string;
    initSeconds: number;
    typeName: string;
    hexColor: string;
    isActive: boolean;
    toggleActive: (title: string) => void;
    className?: string;
};

const SecondsTimer = ({ initSeconds, isActive }: { initSeconds: number; isActive: boolean }) => {
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

        return () => clearTimeout(timeoutId);
    }, [isActive]);

    return (
        <p className={cn('text-muted-foreground min-w-[100px] text-center text-2xl', isActive && 'text-primary')}>
            {dayjs.duration(elapsedSeconds, 's').format('m:ss')}
        </p>
    );
};

export const Item = ({ className, isActive, initSeconds, title, toggleActive, hexColor, typeName }: Props) => {
    return (
        <div className={cn('flex flex-1 items-center justify-between px-8', className)}>
            <div>
                <p className={cn('text-muted-foreground text-lg', isActive && 'text-primary')}>{title}</p>
                <p style={{ color: hexColor }}>{typeName}</p>
            </div>
            <div className="flex items-center gap-5">
                <SecondsTimer isActive={isActive} initSeconds={initSeconds} />
                <Button onClick={() => toggleActive(title)} variant={isActive ? 'accent' : 'outline'} className="w-28 space-x-2">
                    <Clock className="size-5" />
                    <span className="text-lg">{isActive ? 'Stop' : 'Start'}</span>
                </Button>
            </div>
        </div>
    );
};
