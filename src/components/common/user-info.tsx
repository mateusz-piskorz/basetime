'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/use-auth';
import { useInitials } from '@/lib/hooks/use-initials';

export function UserInfo({ showEmail = false }: { showEmail?: boolean }) {
    const getInitials = useInitials();
    const { user } = useAuth();

    const name = user?.name || '';
    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                {/* TODO: add avatar */}
                <AvatarImage src={undefined} alt={name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                {showEmail && <span className="text-muted-foreground truncate text-xs">{user?.email}</span>}
            </div>
        </>
    );
}
