'use client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/common';
import { Clock } from 'lucide-react';
import { SecondsTimer } from './seconds-timer';

type Props = {
    title: string;
    initSeconds: number;
    typeName: string;
    hexColor: string;
    isActive: boolean;
    toggleActive: (title: string) => void;
    className?: string;
};

export const HeroImgItem = ({ className, isActive, initSeconds, title, toggleActive, hexColor, typeName }: Props) => {
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
