'use client';

import { AppLogo } from '@/components/common/app-logo';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    useSidebar,
} from '@/components/ui/sidebar';
import { BriefcaseBusiness, Send } from 'lucide-react';
import Link from 'next/link';
import { NavItem, NavMain } from './nav-main';
import { NavUser } from './nav-user';

export function UserSidebar() {
    const { setOpenMobile } = useSidebar();

    const mainNavItems: NavItem[] = [
        {
            title: 'Organizations',
            href: '/dashboard/user/organizations',
            icon: BriefcaseBusiness,
        },
        {
            title: 'Invitations',
            href: '/dashboard/user/invitations',
            icon: Send,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard/user/organizations" prefetch onClick={() => setOpenMobile(false)}>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarSeparator className="mx-0 mb-2" />

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
