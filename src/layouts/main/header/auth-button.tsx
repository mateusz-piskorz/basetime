'use client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import Link from 'next/link';

export const AuthButton = () => {
    const { user } = useAuth();
    return (
        <Button className="min-h-[36px]" size="sm" variant="secondary">
            {user ? <Link href="/dashboard">Dashboard</Link> : <Link href="/login">Log in</Link>}
        </Button>
    );
};
