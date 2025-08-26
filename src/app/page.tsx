'use client';

import { useAuth } from '@/lib/hooks/use-auth';
import Link from 'next/link';

export default function Home() {
    const { user } = useAuth();
    return (
        <div className="h-[400px] p-4">
            <Link className="inline-block rounded border p-4" href={user ? '/dashboard' : '/login'}>
                {user ? 'Dashboard' : 'Login'}
            </Link>
        </div>
    );
}
