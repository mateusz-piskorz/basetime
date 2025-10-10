'use client';
import { AppLogo } from '@/components/common/app-logo';
import { useIsMobile } from '@/lib/hooks/use-is-mobile';
import Link from 'next/link';
import { DesktopNavigation } from './desktop-navigation';
import { MobileNavigation } from './mobile-navigation';

export const Header = () => {
    const isMobile = useIsMobile();
    return (
        <header className="bg-background mx-auto flex max-w-[1920px] items-center justify-between px-5 pt-5 sm:px-6 sm:pt-6 md:px-8 md:pt-8 lg:px-10 2xl:px-20">
            <Link href="#" className="flex items-center gap-4">
                <AppLogo textClassName="hidden max-md:block lg:block" />
            </Link>
            {isMobile ? <MobileNavigation /> : <DesktopNavigation />}
        </header>
    );
};
