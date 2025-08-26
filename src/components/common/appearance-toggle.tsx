'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';

type Props = {
    variant?: 'icon' | 'default';
    align?: 'start' | 'center' | 'end';
};

export function AppearanceToggle({ align = 'start', variant = 'default' }: Props) {
    const { setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size={variant}>
                    <Sun className="dark:hidden" />
                    <Moon className="hidden dark:block" />
                    {variant === 'default' && <span>{mounted ? resolvedTheme : 'theme'}</span>}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align}>
                <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun />
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon />
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
