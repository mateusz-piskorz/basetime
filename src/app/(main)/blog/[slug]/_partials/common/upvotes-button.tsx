import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/common';
import { Sparkles } from 'lucide-react';

type Props = {
    onClick: () => void;
    disabled: boolean;
    active: boolean;
    upvotes: number;
};

export const UpvotesButton = ({ onClick, disabled, active, upvotes }: Props) => {
    return (
        <Button variant="ghost" onClick={onClick} disabled={disabled}>
            <span className="sr-only">upvotes</span>
            <Sparkles fill={active ? 'var(--accent)' : 'none'} className={cn(active && 'text-accent')} />
            {upvotes}
        </Button>
    );
};
