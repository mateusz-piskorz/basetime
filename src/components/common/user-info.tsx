'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getInitials, getUserAvatarUrl } from '@/lib/utils/common';

type Props = {
    name: string;
    textUnder?: React.ReactNode | string;
    avatarSrc?: string;
    avatarId?: string | null;
    currentUserIndicator?: boolean;
    size?: 'default' | 'lg';
};

export function UserInfo({ name, avatarSrc, textUnder, currentUserIndicator, avatarId, size }: Props) {
    const avatar = avatarId ? getUserAvatarUrl({ avatarId }) : undefined;

    return (
        <>
            <Avatar className={cn('h-8 w-8 overflow-hidden rounded-full border', size === 'lg' && 'h-40 w-40')}>
                <AvatarImage src={avatarSrc || avatar} alt={name} />
                <AvatarFallback className="bg-sidebar-accent rounded-lg text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(name)}
                </AvatarFallback>
            </Avatar>

            <div className={cn('grid flex-1 text-left text-sm leading-tight', size === 'lg' && 'text-center')}>
                <span className={cn('truncate font-medium', size === 'lg' && 'text-2xl')}>
                    {name}
                    {currentUserIndicator && <span className="text-muted-foreground font-normal"> - you</span>}
                </span>
                <span className={cn('text-muted-foreground truncate text-xs', size === 'lg' && 'text-base')}>{textUnder}</span>
            </div>
        </>
    );
}
