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
import { ArrowLeftFromLineIcon, FolderClosed, LayoutGrid, Settings } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { NavItem, NavMain } from './nav-main';
import { NavOrganizations } from './nav-organizations';
import { NavUser } from './nav-user';

export function AppSidebar() {
    const { setOpenMobile } = useSidebar();
    const { organizationId } = useParams<{ organizationId: string | undefined }>();

    const organizationNavItems: NavItem[] = [
        {
            title: 'Back',
            href: '/dashboard',
            icon: ArrowLeftFromLineIcon,
        },
        {
            title: 'Dashboard',
            href: `/dashboard/organization/${organizationId}`,
            icon: LayoutGrid,
        },
        {
            title: 'Projects',
            href: `/dashboard/organization/${organizationId}/projects`,
            icon: FolderClosed,
        },
        {
            title: 'Settings',
            href: `/dashboard/organization/${organizationId}/settings`,
            icon: Settings,
        },
    ];

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                {organizationId ? (
                    <NavOrganizations organizationId={organizationId} />
                ) : (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/dashboard" prefetch onClick={() => setOpenMobile(false)}>
                                    <AppLogo />
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )}
            </SidebarHeader>

            <SidebarSeparator className="mx-0 mb-2" />

            <SidebarContent>
                <NavMain items={organizationId ? organizationNavItems : mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
