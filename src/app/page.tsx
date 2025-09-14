'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import Link from 'next/link';

export default function Home() {
    const { user } = useAuth();

    return (
        <div className="flex h-[400px] items-center justify-center">
            <Link className="mx-auto inline-block rounded border p-4" href={user ? '/dashboard/user/organizations' : '/login'}>
                {user ? 'Dashboard' : 'Login'}
            </Link>
        </div>
    );
}
