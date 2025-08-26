'use client';

import { Button } from '@/components/ui/button';
import { logout } from '@/lib/server-actions/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const LogoutButton = () => {
    const router = useRouter();
    const handleLogout = async () => {
        const res = await logout();
        if (!res.success) {
            toast.error('something went wrong - logout');
            return;
        }

        toast.success('Logged out successfully');
        router.replace('/');
    };
    return (
        <div>
            <Button onClick={handleLogout}>Logout</Button>
        </div>
    );
};
