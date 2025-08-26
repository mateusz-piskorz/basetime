'use client';

import { AppLogo } from '@/components/common/app-logo';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { NavItem, NavMain } from './nav-main';
import { NavUser } from './nav-user';

export function AppSidebar() {
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        // {
        //     title: locale.Invoices,
        //     href: route('invoices'),
        //     icon: RadioReceiver,
        // },
        // {
        //     title: locale.Contractors,
        //     href: route('contractors'),
        //     icon: Users2,
        // },
        // {
        //     title: locale.Products,
        //     href: route('products'),
        //     icon: AirVentIcon,
        // },
        // {
        //     title: locale.Analytics,
        //     href: route('analytics'),
        //     icon: ChartNoAxesCombined,
        // },
        // {
        //     title: locale['Premium Account'],
        //     href: route('premium-account'),
        //     icon: Crown,
        // },
    ];

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
            {/* todo: here we should display button for settings and profile next to it */}
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
