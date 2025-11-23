'use client';
import React from 'react';

import { AppearanceToggle } from '@/components/common/appearance-toggle';
import { AuthButton } from '@/components/common/auth-button';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { NAV_LIST } from '@/lib/constants/nav-list';
import { Menu } from 'lucide-react';
import Link from 'next/link';

export const MobileNavigation = () => {
    const [open, setOpen] = React.useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="icon" variant="ghost" className="h-[32px] min-h-[32px] lg:hidden">
                    <Menu className="size-8" />
                </Button>
            </SheetTrigger>

            <SheetContent side="left" className="max-w-sm px-8 py-12 lg:hidden">
                <SheetHeader className="sr-only">
                    <SheetTitle>Navigation</SheetTitle>
                    <SheetDescription>Displays the mobile navigation</SheetDescription>
                </SheetHeader>
                <Navigation closeSidebar={() => setOpen(false)} />
            </SheetContent>
        </Sheet>
    );
};

type NavProps = {
    closeSidebar: () => void;
};

const Navigation = ({ closeSidebar }: NavProps) => {
    return (
        <div className="space-y-5">
            <nav>
                <ul className="flex list-none flex-col gap-5">
                    {NAV_LIST.map((item) => (
                        <li key={item.label} className="flex cursor-pointer items-center gap-4 text-xl">
                            <Link onClick={closeSidebar} href={item.href}>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                    <li>
                        <AuthButton />
                    </li>
                </ul>
            </nav>
            <div className="flex flex-wrap gap-5">
                <AppearanceToggle />
            </div>
        </div>
    );
};
