'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/use-auth';
import { cn, getInitials } from '@/lib/utils/common';

type Props = {
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };

    showEmail?: boolean;
    showCurrentUserIndicator?: boolean;
    onlyAvatar?: boolean;
    size?: 'sm' | 'lg';
};

export function UserInfo(props: Props) {
    const auth = useAuth();
    const user = props.user || auth.user;
    const name = user?.name || '';

    return (
        <>
            <Avatar className={cn('h-8 w-8 overflow-hidden rounded-full', props.size === 'lg' && 'h-[100px] w-[100px]')}>
                <AvatarImage src={user?.avatar} alt={name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(name)}
                </AvatarFallback>
            </Avatar>
            {!props.onlyAvatar && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                        {name}
                        {props.showCurrentUserIndicator && <span className="text-muted-foreground font-normal"> (You)</span>}
                    </span>
                    {props.showEmail && <span className="text-muted-foreground truncate text-xs">{user?.email}</span>}
                </div>
            )}
        </>
    );
}
