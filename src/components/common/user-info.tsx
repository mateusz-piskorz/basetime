'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { useAuth } from '@/lib/hooks/use-auth';

export function UserInfo({ showEmail = false }: { showEmail?: boolean }) {
    const getInitials = useInitials();
    const { user } = useAuth();

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                {/* TODO: add avatar */}
                <AvatarImage src={undefined} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && <span className="text-muted-foreground truncate text-xs">{user.email}</span>}
            </div>
        </>
    );
}
