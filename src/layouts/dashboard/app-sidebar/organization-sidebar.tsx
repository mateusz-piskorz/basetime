'use client';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenuButton, SidebarSeparator } from '@/components/ui/sidebar';
import { useMember } from '@/lib/hooks/use-member';
import { ArrowLeftFromLineIcon, ChartNoAxesColumnIncreasing, Clock, FolderClosed, LayoutGrid, Settings, Users2 } from 'lucide-react';
import Link from 'next/link';
import { NavItem, NavMain } from './nav-main';
import { NavUser } from './nav-user';

export function OrganizationSidebar() {
    const { member, organizationId } = useMember();

    const organizationNavItems: NavItem[] = [
        {
            title: 'Overview',
            href: `/dashboard/${organizationId}/overview`,
            icon: LayoutGrid,
        },
        {
            title: 'Time',
            href: `/dashboard/${organizationId}/time`,
            icon: Clock,
        },
        {
            title: 'Reports',
            href: `/dashboard/${organizationId}/reports`,
            icon: ChartNoAxesColumnIncreasing,
        },
        {
            title: 'Projects',
            href: `/dashboard/${organizationId}/projects`,
            icon: FolderClosed,
        },
        {
            title: 'Members',
            href: `/dashboard/${organizationId}/members`,
            icon: Users2,
        },
        ...(member.role == 'OWNER'
            ? [
                  {
                      title: 'Settings',
                      href: `/dashboard/${organizationId}/settings`,
                      icon: Settings,
                  },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader>
                <SidebarMenuButton size="lg" asChild>
                    <Link href="/dashboard/user">
                        <ArrowLeftFromLineIcon />
                        <span>Back to main panel</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarHeader>

            <SidebarSeparator className="mx-0 mb-2" />

            <SidebarContent>
                <NavMain items={organizationNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
