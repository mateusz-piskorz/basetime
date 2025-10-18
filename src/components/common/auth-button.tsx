'use client';

import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/client';
import Link from 'next/link';
import { ComponentProps } from 'react';

type Props = {
    variant?: ComponentProps<typeof Button>['variant'];
    size?: ComponentProps<typeof Button>['size'];
    text?: string;
};

export const AuthButton = ({ variant = 'secondary', size = 'sm', text }: Props) => {
    const { data } = trpc.currentUser.useQuery();

    return (
        <Button size={size} variant={variant} asChild>
            {data ? <Link href="/dashboard">{text || 'Dashboard'}</Link> : <Link href="/login">{text || 'Log in'}</Link>}
        </Button>
    );
};
