'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/common';

type Props = {
    className?: string;
};

export const DocText = ({ className }: Props) => {
    return (
        <div className={cn('px-5 text-center sm:px-6 md:px-8 xl:px-12', className)}>
            <div className="mx-auto flex flex-col items-center gap-6 lg:items-start lg:text-start 2xl:max-w-[600px]">
                <h1 className="text-2xl leading-snug font-semibold lg:text-2xl xl:text-3xl 2xl:text-5xl">
                    <span className="text-accent">Time tracker</span> - your team will actually use
                </h1>
                <p className="text-muted font-mono text-sm 2xl:text-base">
                    Modern, accurate, simple, and user-friendly. Spend less time logging hours — and more time getting work done.
                </p>
                <Button size="default" variant="accent">
                    Get Started
                </Button>
            </div>
        </div>
    );
};
