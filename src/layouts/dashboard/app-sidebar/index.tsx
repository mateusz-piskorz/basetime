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
import { LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { NavItem, NavMain } from './nav-main';
import { NavOrganizations } from './nav-organizations';
import { NavUser } from './nav-user';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
];

export function AppSidebar() {
    const { setOpenMobile } = useSidebar();
    const { organizationId } = useParams<{ organizationId: string | undefined }>();

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

            <SidebarSeparator className="mx-0 mb-4" />

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
