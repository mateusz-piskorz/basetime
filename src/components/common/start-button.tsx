import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/common';
import { Pause, Play } from 'lucide-react';

type Props = {
    className?: string;
    onClick?: () => void;
    type?: 'submit' | 'button';
    actionState: 'start' | 'stop';
    disabled?: boolean;
    size?: 'sm' | 'base';
};

export const StartButton = ({ className, onClick, type, actionState, disabled, size = 'base' }: Props) => {
    return (
        <Button
            disabled={disabled}
            className={cn(
                'bg-accent/80 hover:bg-accent/100 size-14 rounded-full border-8 hover:scale-110',
                actionState === 'stop' && 'bg-[#FF0000] hover:bg-[#FF0000] dark:border-[#810000]',
                size === 'sm' && 'size-12 border-6',
                className,
            )}
            onClick={onClick}
            type={type}
        >
            {actionState === 'start' ? (
                <Play className={cn('size-6', size === 'sm' && 'size-5')} />
            ) : (
                <Pause color="white" className={cn('size-6', size === 'sm' && 'size-5')} />
            )}
        </Button>
    );
};
