'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { cn, getInitials, getUserAvatarUrl } from '@/lib/utils/common';

type Props = {
    name: string;
    textUnder?: string;
    avatarId?: string | null;
    currentUserIndicator?: boolean;
};

export function UserInfo({ name, avatarId, textUnder, currentUserIndicator }: Props) {
    return (
        <>
            <Avatar className={cn('h-8 w-8 overflow-hidden rounded-full')}>
                <AvatarImage src={avatarId ? getUserAvatarUrl({ avatarId }) : undefined} alt={name} />
                <AvatarFallback className="bg-sidebar-accent rounded-lg text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(name)}
                </AvatarFallback>
            </Avatar>

            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                    {name}
                    {currentUserIndicator && <span className="text-muted-foreground font-normal">(You)</span>}
                </span>
                <span className="text-muted-foreground truncate text-xs">{textUnder}</span>
            </div>
        </>
    );
}
