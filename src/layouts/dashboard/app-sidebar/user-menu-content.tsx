'use client';

import { UserInfo } from '@/components/common/user-info';
import { Button } from '@/components/ui/button';
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/server-actions/auth';
import { LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function UserMenuContent() {
    const router = useRouter();

    const handleLogout = async () => {
        const res = await logout();
        if (!res.success) {
            toast.error(res.message);
            return;
        }
        toast.success('Logged out successfully');
        router.replace('/');
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href="/dashboard/settings" as="button" prefetch>
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Button onClick={handleLogout} variant="outline">
                    <LogOut className="mr-2" />
                    Log out
                </Button>
            </DropdownMenuItem>
        </>
    );
}
