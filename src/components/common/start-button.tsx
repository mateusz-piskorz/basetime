import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Pause, Play } from 'lucide-react';

type Props = {
    className?: string;
    onClick?: () => void;
    type?: 'submit' | 'button';
    actionState: 'start' | 'stop';
    disabled?: boolean;
};

export const StartButton = ({ className, onClick, type, actionState, disabled }: Props) => {
    return (
        <Button
            disabled={disabled}
            className={cn('bg-accent-secondary/80 hover:bg-accent-secondary/100 size-14 rounded-xl border-6 hover:scale-110', className)}
            onClick={onClick}
            type={type}
        >
            {actionState === 'start' ? <Play className="size-6" /> : <Pause className="size-6" />}
        </Button>
    );
};
