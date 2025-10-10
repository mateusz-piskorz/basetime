import { TimerSeconds } from '@/components/common/TimerSeconds';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/common';
import { Clock } from 'lucide-react';

const heroImgItemType = {
    Design: { name: 'Design', color: '#449DD1' },
    Research: { name: 'Research', color: '#F49D37' },
    Development: { name: 'Development', color: '#E5E7E6' },
};

type Props = {
    title: string;
    initialSeconds: number;
    isActive: boolean;
    toggleActive: (title: string) => void;
    type: keyof typeof heroImgItemType;
    className?: string;
};

export const HeroImgItem = ({ className, isActive, initialSeconds, title, type, toggleActive }: Props) => {
    return (
        <div className={cn('flex flex-1 items-center justify-between px-8', className)}>
            <div>
                <p className={cn('text-muted-foreground font-mono text-lg', isActive && 'text-primary')}>{title}</p>
                <p style={{ color: heroImgItemType[type].color }}>{heroImgItemType[type].name}</p>
            </div>
            <div className="flex items-center gap-5">
                <TimerSeconds
                    initialSeconds={initialSeconds}
                    isActive={isActive}
                    className={cn('text-2xl font-medium sm:text-2xl sm:font-medium', !isActive && 'text-muted-foreground')}
                />
                <Button onClick={() => toggleActive(title)} variant={isActive ? 'accent' : 'outline'} className="w-28 space-x-2">
                    <Clock className="size-5" />
                    <span className="text-lg">{isActive ? 'Stop' : 'Start'}</span>
                </Button>
            </div>
        </div>
    );
};
