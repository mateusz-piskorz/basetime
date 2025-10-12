'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import Link from 'next/link';
import { ComponentProps } from 'react';

type Props = {
    variant?: ComponentProps<typeof Button>['variant'];
    size?: ComponentProps<typeof Button>['size'];
    text?: string;
};

export const AuthButton = ({ variant = 'secondary', size = 'sm', text }: Props) => {
    const { user } = useAuth();

    return (
        <Button className="min-h-[36px]" size={size} variant={variant} asChild>
            {user ? <Link href="/dashboard">{text || 'Dashboard'}</Link> : <Link href="/login">{text || 'Log in'}</Link>}
        </Button>
    );
};
